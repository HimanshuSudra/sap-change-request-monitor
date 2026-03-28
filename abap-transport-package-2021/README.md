# PCMS SAP 2021 Transport Package

This package is prepared for SAP 2021-style development in Eclipse ADT and uses CDS view entities instead of classic CDS views.

## Files

- `ZI_PCMS_TR_MONITOR.ddls.asddls`
  Root CDS view entity for transport monitoring.
- `ZC_PCMS_TR_MONITOR.ddls.asddls`
  Projection CDS view entity for service exposure.
- `ZUI_PCMS_TR_MONITOR.srvd.abap`
  Service definition.
- `ZCL_PCMS_TR_ACTIONS.clas.abap`
  ABAP class skeleton for QA and PROD movement wrappers.
- `ZPCMS_TR_ACTION_TEST.prog.abap`
  Small test report to validate details, QA move, and PROD move from ADT.
- `ZCL_PCMS_TR_HTTP.clas.abap`
  HTTP endpoint class so PCMS can call transport actions with JSON.
- `HTTP_SETUP_GUIDE.md`
  SICF and request/response setup notes for the HTTP endpoint.
- `SETUP_GUIDE.md`
  Activation steps for Eclipse / ADT.

## Important

The monitoring CDS entities are ready to activate.

The movement class is intentionally a safe wrapper skeleton. For actual transport movement in your landscape, your Basis team must confirm the exact SAP-standard function modules or classes permitted for:

- queueing a request into QA
- importing into QA
- queueing a request into PROD
- importing into PROD

Do not hardcode TMS import calls in production without Basis validation.
