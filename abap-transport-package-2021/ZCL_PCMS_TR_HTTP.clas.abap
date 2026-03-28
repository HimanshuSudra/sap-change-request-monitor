CLASS zcl_pcms_tr_http DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_http_extension.

  PRIVATE SECTION.
    TYPES:
      BEGIN OF ty_request,
        trNumber      TYPE e070-trkorr,
        target        TYPE char10,
        targetSystem  TYPE tmscsys-sysnam,
        targetClient  TYPE tmsbuffer-tarcli,
      END OF ty_request.

    TYPES:
      BEGIN OF ty_response,
        success       TYPE abap_bool,
        trNumber      TYPE e070-trkorr,
        target        TYPE char10,
        targetSystem  TYPE tmscsys-sysnam,
        targetClient  TYPE tmsbuffer-tarcli,
        status        TYPE char20,
        tpRetCode     TYPE stpa-retcode,
        tpAlog        TYPE stpa-file,
        tpSlog        TYPE stpa-file,
        message       TYPE string,
      END OF ty_response.

    METHODS handle_post
      IMPORTING
        server TYPE REF TO if_http_server.

    METHODS handle_get
      IMPORTING
        server TYPE REF TO if_http_server.

    METHODS send_json
      IMPORTING
        server      TYPE REF TO if_http_server
        iv_status   TYPE i
        iv_payload  TYPE string.

    METHODS parse_request
      IMPORTING
        iv_body            TYPE string
      RETURNING
        VALUE(rs_request)  TYPE ty_request.
ENDCLASS.

CLASS zcl_pcms_tr_http IMPLEMENTATION.

  METHOD if_http_extension~handle_request.
    DATA(lv_method) = server->request->get_header_field( '~request_method' ).

    CASE lv_method.
      WHEN 'GET'.
        handle_get( server ).
      WHEN 'POST'.
        handle_post( server ).
      WHEN OTHERS.
        send_json(
          server     = server
          iv_status  = 405
          iv_payload = |\{"success":false,"message":"Method not allowed. Use GET or POST."\}|
        ).
    ENDCASE.
  ENDMETHOD.

  METHOD handle_get.
    DATA(lv_trkorr) = server->request->get_form_field( 'trNumber' ).

    IF lv_trkorr IS INITIAL.
      send_json(
        server     = server
        iv_status  = 400
        iv_payload = |\{"success":false,"message":"Pass trNumber as query parameter."\}|
      ).
      RETURN.
    ENDIF.

    TRY.
        DATA(ls_details) = zcl_pcms_tr_actions=>get_transport_details( lv_trkorr ).
        DATA(lv_json) = /ui2/cl_json=>serialize(
          data        = ls_details
          pretty_name = /ui2/cl_json=>pretty_mode-camel_case
        ).

        send_json(
          server     = server
          iv_status  = 200
          iv_payload = |\{"success":true,"data":| && lv_json && |\}|
        ).
      CATCH cx_root INTO DATA(lx_root).
        send_json(
          server     = server
          iv_status  = 500
          iv_payload = |\{"success":false,"message":"| && lx_root->get_text( ) && |"\}|
        ).
    ENDTRY.
  ENDMETHOD.

  METHOD parse_request.
    /ui2/cl_json=>deserialize(
      EXPORTING
        json        = iv_body
        pretty_name = /ui2/cl_json=>pretty_mode-camel_case
      CHANGING
        data        = rs_request
    ).
  ENDMETHOD.

  METHOD handle_post.
    DATA(lv_body) = server->request->get_cdata( ).
    DATA(ls_request) = parse_request( lv_body ).

    IF ls_request-trNumber IS INITIAL OR ls_request-target IS INITIAL
       OR ls_request-targetSystem IS INITIAL OR ls_request-targetClient IS INITIAL.
      send_json(
        server     = server
        iv_status  = 400
        iv_payload = |\{"success":false,"message":"trNumber, target, targetSystem and targetClient are required."\}|
      ).
      RETURN.
    ENDIF.

    TRY.
        DATA(ls_result) = VALUE zcl_pcms_tr_actions=>ty_result( ).

        CASE ls_request-target.
          WHEN 'QA'.
            ls_result = zcl_pcms_tr_actions=>move_to_qa(
              iv_trkorr        = ls_request-trNumber
              iv_target_system = ls_request-targetSystem
              iv_target_client = ls_request-targetClient
            ).
          WHEN 'PROD'.
            ls_result = zcl_pcms_tr_actions=>move_to_prod(
              iv_trkorr        = ls_request-trNumber
              iv_target_system = ls_request-targetSystem
              iv_target_client = ls_request-targetClient
            ).
          WHEN OTHERS.
            send_json(
              server     = server
              iv_status  = 400
              iv_payload = |\{"success":false,"message":"target must be QA or PROD."\}|
            ).
            RETURN.
        ENDCASE.

        DATA(ls_response) = VALUE ty_response(
          success      = xsdbool( ls_result-status <> 'FAILED' )
          trNumber     = ls_result-trkorr
          target       = ls_result-target
          targetSystem = ls_result-target
          targetClient = ls_result-target_client
          status       = ls_result-status
          tpRetCode    = ls_result-tp_ret_code
          tpAlog       = ls_result-tp_alog
          tpSlog       = ls_result-tp_slog
          message      = ls_result-message
        ).

        DATA(lv_json) = /ui2/cl_json=>serialize(
          data        = ls_response
          pretty_name = /ui2/cl_json=>pretty_mode-camel_case
        ).

        send_json(
          server     = server
          iv_status  = COND i( WHEN ls_response-success = abap_true THEN 200 ELSE 500 )
          iv_payload = |\{"success":| &&
                       COND string( WHEN ls_response-success = abap_true THEN 'true' ELSE 'false' ) &&
                       |,"data":| && lv_json && |\}|
        ).
      CATCH cx_root INTO DATA(lx_root).
        send_json(
          server     = server
          iv_status  = 500
          iv_payload = |\{"success":false,"message":"| && lx_root->get_text( ) && |"\}|
        ).
    ENDTRY.
  ENDMETHOD.

  METHOD send_json.
    server->response->set_status( code = iv_status reason = '' ).
    server->response->set_content_type( content_type = 'application/json; charset=utf-8' ).
    server->response->set_cdata( iv_payload ).
  ENDMETHOD.

ENDCLASS.
