REPORT zpcms_tr_action_test.

PARAMETERS:
  p_trkorr TYPE e070-trkorr OBLIGATORY,
  p_tarsys TYPE tmscsys-sysnam OBLIGATORY,
  p_tarcli TYPE tmsbuffer-tarcli OBLIGATORY,
  p_mode   TYPE char10 DEFAULT 'DETAILS'.

START-OF-SELECTION.
  CASE p_mode.
    WHEN 'DETAILS'.
      DATA(ls_details) = zcl_pcms_tr_actions=>get_transport_details( p_trkorr ).
      cl_demo_output=>display( ls_details ).

    WHEN 'QA'.
      DATA(ls_qa_result) = zcl_pcms_tr_actions=>move_to_qa(
        iv_trkorr        = p_trkorr
        iv_target_system = p_tarsys
        iv_target_client = p_tarcli
      ).
      cl_demo_output=>display( ls_qa_result ).

    WHEN 'PROD'.
      DATA(ls_prod_result) = zcl_pcms_tr_actions=>move_to_prod(
        iv_trkorr        = p_trkorr
        iv_target_system = p_tarsys
        iv_target_client = p_tarcli
      ).
      cl_demo_output=>display( ls_prod_result ).

    WHEN OTHERS.
      MESSAGE 'Use DETAILS, QA or PROD in P_MODE.' TYPE 'S' DISPLAY LIKE 'E'.
  ENDCASE.
