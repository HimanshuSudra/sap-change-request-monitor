# Setup Guide

## Option A: Recommended Modern Flow

Use this if your ADT system supports service definitions and service bindings for OData V2.

### 1. Create the CDS Views

Create these ABAP repository objects in your package:

- `ZI_TR_MONITOR`
- `ZC_TR_MONITOR`

Activate both.

### 2. Create the Service Definition

Create service definition:

- Name: `ZUI_TR_MONITOR`

Use the source from `ZUI_TR_MONITOR.srvd.abap`.

Activate it.

### 3. Create the Service Binding

In ADT:

1. Right-click package
2. New
3. Service Binding
4. Choose service definition `ZUI_TR_MONITOR`
5. Binding type:
   - prefer `OData V2 - UI` for quick UI-style consumption
   - or `OData V2 - Web API` if your system offers that and you want API-oriented usage

Activate the binding.

### 4. Get the Endpoint URL

Open the service binding in ADT and copy:

- `Service URL`
- optionally `$metadata`

Do not guess the URL manually. Copy the exact URL shown in the service binding editor because it differs by release and binding type.

### 5. Test

Test URLs such as:

- `<service-url>`
- `<service-url>/$metadata`
- `<service-url>/TransportRequest`
- `<service-url>/TransportRequest?$top=20`

## Option B: Fallback for Older Systems

If your system does not support the service binding flow cleanly for this object:

1. Create the CDS object from `FALLBACK_ZC_TR_MONITOR_ODATA_PUBLISH.ddls.asddls`
2. Activate it
3. In SAP Gateway, find the generated service
4. Register/activate it if required by your release

Typical generated technical service name pattern:

- `ZC_TR_MONITOR_PUB_CDS`

Typical classic OData V2 URL pattern:

- `/sap/opu/odata/sap/ZC_TR_MONITOR_PUB_CDS/`

Your exact service name can differ. Check the generated object in your system.

## Suggested First Filter Tests

Use these once the service is up:

- `$top=10`
- `$filter=CreatedBy eq 'YOURUSER'`
- `$filter=RequestStatus eq 'R'`

## Common Next Extension

Once the base service works, extend the CDS or add a custom entity to include:

- source system
- source client
- request category mapping
- release flag text
- QA import status
- PROD import status
- imported by
- import timestamp

These often need Basis confirmation depending on your landscape and release.
