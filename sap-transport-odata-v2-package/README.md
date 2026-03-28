# SAP Transport Monitoring OData V2 Package

This bundle gives you a starting point to build an SAP OData V2 service for transport-request monitoring in your SAP system and then share the endpoint URL back for app integration.

## What Is Included

- `src/ZI_TR_MONITOR.ddls.asddls`
  Interface CDS view that reads transport header data and text.
- `src/ZC_TR_MONITOR.ddls.asddls`
  Consumption CDS view for the service layer.
- `src/ZUI_TR_MONITOR.srvd.abap`
  Service definition for exposing the CDS view.
- `src/FALLBACK_ZC_TR_MONITOR_ODATA_PUBLISH.ddls.asddls`
  Older-system fallback using `@OData.publish: true`.
- `src/SETUP_GUIDE.md`
  Step-by-step creation and activation guide in ADT.
- `src/FIELD_MAPPING_NOTES.md`
  Notes on the SAP transport tables and where you may need Basis help for QA/PRD import tracking.

## Recommended Approach

Use the modern flow if your system supports it:

1. Create CDS data definitions.
2. Create a service definition.
3. Create a service binding with type `OData V2 - UI` or `OData V2 - Web API` depending on your release and need.
4. Activate the service binding.
5. Copy the generated service URL from the binding editor.

If your system is older and does not support service definition/binding for your use case, use the fallback CDS file with `@OData.publish: true`.

## Important Note About Real-Time QA/PRD Import Status

This package covers transport header details cleanly from core CTS tables such as:

- `E070`
- `E07T`

Fields like "imported to QA", "imported to PROD", "imported by", and import timestamps are often sourced from TMS/import history objects that vary by landscape and Basis setup. That part usually needs one of these:

- additional CDS over your release-specific TMS tables/views
- an SAP function module or class exposed through RAP/custom entity
- Basis-team confirmation of the correct source objects

So this package gets you the base transport service running first, with clean extension points for the import-status portion.

## What To Send Back

After you create and activate the service in SAP, send back:

1. The OData V2 endpoint URL
2. A sample payload for one transport request
3. Whether your system used:
   - service definition + service binding, or
   - `@OData.publish: true`

## Reference

This package follows SAP's standard CDS-to-service flow using service definitions and service bindings, as documented in SAP Help:

- [Defining an OData Service](https://help.sap.com/docs/abap-cloud/abap-rap/defining-odata-service)
- [Exposing a CDS View for an OData Service](https://help.sap.com/docs/ABAP_PLATFORM_1909/fc4c71aa50014fd1b43721701471913d/fe4e1ced2d3548259f34c4ee03ccc5fd.html)
- [Creating a Service Binding](https://help.sap.com/docs/abap-cloud/abap-rap/creating-service-binding)
- [Using Service Binding Editor for OData V2 Service](https://help.sap.com/docs/abap-cloud/abap-development-tools-user-guide/using-service-binding-editor-for-odata-v2-service)
