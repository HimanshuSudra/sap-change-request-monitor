CLASS zcl_pcms_tr_actions DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    TYPES:
      BEGIN OF ty_transport_details,
        trkorr            TYPE e070-trkorr,
        parent_request    TYPE e070-strkorr,
        created_by        TYPE e070-as4user,
        created_on        TYPE e070-as4date,
        created_at        TYPE e070-as4time,
        request_type      TYPE e070-trfunction,
        request_status    TYPE e070-trstatus,
        development_class TYPE e070-korrdev,
        target_system     TYPE e070-tarsystem,
        request_text      TYPE e07t-as4text,
      END OF ty_transport_details,
      BEGIN OF ty_result,
        trkorr        TYPE e070-trkorr,
        target        TYPE tmscsys-sysnam,
        target_client TYPE tmsbuffer-tarcli,
        action        TYPE char20,
        status        TYPE char20,
        tp_ret_code   TYPE stpa-retcode,
        tp_alog       TYPE stpa-file,
        tp_slog       TYPE stpa-file,
        message       TYPE string,
      END OF ty_result.

    CLASS-METHODS get_transport_details
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
      RETURNING
        VALUE(rs_details)  TYPE ty_transport_details.

    CLASS-METHODS move_to_qa
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
        iv_target_system   TYPE tmscsys-sysnam
        iv_target_client   TYPE tmsbuffer-tarcli
      RETURNING
        VALUE(rs_result)   TYPE ty_result.

    CLASS-METHODS move_to_prod
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
        iv_target_system   TYPE tmscsys-sysnam
        iv_target_client   TYPE tmsbuffer-tarcli
      RETURNING
        VALUE(rs_result)   TYPE ty_result.

  PRIVATE SECTION.
    CLASS-METHODS validate_transport
      IMPORTING
        iv_trkorr TYPE e070-trkorr.

    CLASS-METHODS is_released
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
      RETURNING
        VALUE(rv_released) TYPE abap_bool.

    CLASS-METHODS move_to_target
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
        iv_target_system   TYPE tmscsys-sysnam
        iv_target_client   TYPE tmsbuffer-tarcli
        iv_action          TYPE char20
      RETURNING
        VALUE(rs_result)   TYPE ty_result.

    CLASS-METHODS forward_to_queue
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
        iv_target_system   TYPE tmscsys-sysnam
        iv_target_client   TYPE tmsbuffer-tarcli
      CHANGING
        cs_result          TYPE ty_result.

    CLASS-METHODS import_into_target
      IMPORTING
        iv_trkorr          TYPE e070-trkorr
        iv_target_system   TYPE tmscsys-sysnam
        iv_target_client   TYPE tmsbuffer-tarcli
      CHANGING
        cs_result          TYPE ty_result.

    CLASS-METHODS retcode_is_success
      IMPORTING
        iv_retcode         TYPE stpa-retcode
      RETURNING
        VALUE(rv_success)  TYPE abap_bool.
ENDCLASS.

CLASS zcl_pcms_tr_actions IMPLEMENTATION.

  METHOD get_transport_details.
    SELECT SINGLE
      Transport~trkorr      AS trkorr,
      Transport~strkorr     AS parent_request,
      Transport~as4user     AS created_by,
      Transport~as4date     AS created_on,
      Transport~as4time     AS created_at,
      Transport~trfunction  AS request_type,
      Transport~trstatus    AS request_status,
      Transport~korrdev     AS development_class,
      Transport~tarsystem   AS target_system,
      Text~as4text          AS request_text
      FROM e070 AS Transport
      LEFT OUTER JOIN e07t AS Text
        ON Text~trkorr = Transport~trkorr
       AND Text~langu  = @sy-langu
      WHERE Transport~trkorr = @iv_trkorr
      INTO CORRESPONDING FIELDS OF @rs_details.
  ENDMETHOD.

  METHOD validate_transport.
    SELECT SINGLE trkorr
      FROM e070
      WHERE trkorr = @iv_trkorr
      INTO @DATA(lv_trkorr).

    IF sy-subrc <> 0.
      RAISE EXCEPTION TYPE cx_sy_itab_line_not_found.
    ENDIF.
  ENDMETHOD.

  METHOD is_released.
    SELECT SINGLE trstatus
      FROM e070
      WHERE trkorr = @iv_trkorr
      INTO @DATA(lv_trstatus).

    IF sy-subrc <> 0.
      rv_released = abap_false.
      RETURN.
    ENDIF.

    rv_released = xsdbool( lv_trstatus = 'R' ).
  ENDMETHOD.

  METHOD retcode_is_success.
    rv_success = xsdbool( iv_retcode IS INITIAL OR iv_retcode <= 4 ).
  ENDMETHOD.

  METHOD forward_to_queue.
    DATA: lv_ret_code        TYPE stpa-retcode,
          lv_tp_alog         TYPE stpa-file,
          lv_tp_slog         TYPE stpa-file,
          lv_tp_pid          TYPE stpa-pid,
          lv_different_grps  TYPE stms_flag,
          ls_exception       TYPE stmscalert.

    CALL FUNCTION 'TMS_MGR_FORWARD_TR_REQUEST'
      EXPORTING
        iv_request          = iv_trkorr
        iv_target           = iv_target_system
        iv_tarcli           = iv_target_client
        iv_source           = sy-sysid
        iv_monitor          = space
        iv_verbose          = space
      IMPORTING
        ev_different_groups = lv_different_grps
        ev_tp_ret_code      = lv_ret_code
        ev_tp_alog          = lv_tp_alog
        ev_tp_slog          = lv_tp_slog
        ev_tp_pid           = lv_tp_pid
        es_exception        = ls_exception
      EXCEPTIONS
        read_config_failed        = 1
        table_of_requests_is_empty = 2
        OTHERS                    = 3.

    cs_result-tp_ret_code = lv_ret_code.
    cs_result-tp_alog     = lv_tp_alog.
    cs_result-tp_slog     = lv_tp_slog.

    IF sy-subrc <> 0 OR retcode_is_success( lv_ret_code ) = abap_false.
      cs_result-status  = 'FAILED'.
      cs_result-message = |Queue forward failed for { iv_trkorr } to { iv_target_system }.|.
    ELSE.
      cs_result-status  = 'QUEUED'.
      cs_result-message = |Transport { iv_trkorr } forwarded to import queue of { iv_target_system }.|.
    ENDIF.
  ENDMETHOD.

  METHOD import_into_target.
    DATA: lv_ret_code    TYPE stpa-retcode,
          lv_tp_alog     TYPE stpa-file,
          lv_tp_slog     TYPE stpa-file,
          lv_tp_pid      TYPE stpa-pid,
          lv_tpstat_key  TYPE tmstpkey,
          ls_exception   TYPE stmscalert.

    CALL FUNCTION 'TMS_MGR_IMPORT_TR_REQUEST'
      EXPORTING
        iv_system              = iv_target_system
        iv_request             = iv_trkorr
        iv_client              = iv_target_client
        iv_monitor             = space
        iv_verbose             = space
        iv_ignore_predec       = space
        iv_ignore_cvers        = space
      IMPORTING
        ev_tp_ret_code         = lv_ret_code
        ev_tp_alog             = lv_tp_alog
        ev_tp_slog             = lv_tp_slog
        ev_tp_pid              = lv_tp_pid
        ev_tpstat_key          = lv_tpstat_key
        es_exception           = ls_exception
      EXCEPTIONS
        read_config_failed        = 1
        table_of_requests_is_empty = 2
        OTHERS                    = 3.

    cs_result-tp_ret_code = lv_ret_code.
    cs_result-tp_alog     = lv_tp_alog.
    cs_result-tp_slog     = lv_tp_slog.

    IF sy-subrc <> 0 OR retcode_is_success( lv_ret_code ) = abap_false.
      cs_result-status  = 'FAILED'.
      cs_result-message = |Import failed for { iv_trkorr } in { iv_target_system }.|.
    ELSE.
      cs_result-status  = 'IMPORTED'.
      cs_result-message = |Transport { iv_trkorr } imported into { iv_target_system } successfully.|.
    ENDIF.
  ENDMETHOD.

  METHOD move_to_target.
    CLEAR rs_result.

    rs_result-trkorr        = iv_trkorr.
    rs_result-target        = iv_target_system.
    rs_result-target_client = iv_target_client.
    rs_result-action        = iv_action.
    rs_result-status        = 'STARTED'.

      TRY.
        validate_transport( iv_trkorr ).

        IF is_released( iv_trkorr ) = abap_false.
          rs_result-status  = 'FAILED'.
          rs_result-message = |Transport { iv_trkorr } is not released yet. Release it in DEV before sending it to { iv_target_system }.|.
          RETURN.
        ENDIF.

        forward_to_queue(
          EXPORTING
            iv_trkorr        = iv_trkorr
            iv_target_system = iv_target_system
            iv_target_client = iv_target_client
          CHANGING
            cs_result        = rs_result
        ).

        IF rs_result-status = 'FAILED'.
          RETURN.
        ENDIF.

        import_into_target(
          EXPORTING
            iv_trkorr        = iv_trkorr
            iv_target_system = iv_target_system
            iv_target_client = iv_target_client
          CHANGING
            cs_result        = rs_result
        ).

      CATCH cx_root INTO DATA(lx_root).
        rs_result-status  = 'FAILED'.
        rs_result-message = lx_root->get_text( ).
    ENDTRY.
  ENDMETHOD.

  METHOD move_to_qa.
    rs_result = move_to_target(
      iv_trkorr        = iv_trkorr
      iv_target_system = iv_target_system
      iv_target_client = iv_target_client
      iv_action        = 'MOVE_TO_QA'
    ).
  ENDMETHOD.

  METHOD move_to_prod.
    rs_result = move_to_target(
      iv_trkorr        = iv_trkorr
      iv_target_system = iv_target_system
      iv_target_client = iv_target_client
      iv_action        = 'MOVE_TO_PROD'
    ).
  ENDMETHOD.

ENDCLASS.
