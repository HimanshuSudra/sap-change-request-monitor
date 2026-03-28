# SAP 2021 Eclipse Setup Guide

## 1. Create the CDS view entities

Create these objects in ADT and activate them:

- `ZI_PCMS_TR_MONITOR`
- `ZC_PCMS_TR_MONITOR`

## 2. Create the service definition

Create:

- `ZUI_PCMS_TR_MONITOR`

Activate it.

## 3. Create the service binding

In Eclipse ADT:

1. Right-click your package
2. New
3. Service Binding
4. Choose service definition `ZUI_PCMS_TR_MONITOR`
5. Select `OData V2 - Web API` if available, otherwise `OData V2 - UI`
6. Activate the binding

Copy the exact service URL shown by ADT after activation.

## 4. Test the endpoint

Use:

- `<service-url>`
- `<service-url>/$metadata`
- `<service-url>/TransportRequest`
- `<service-url>/TransportRequest?$top=50`

## 5. Action wrapper

Create class:

- `ZCL_PCMS_TR_ACTIONS`

This class now includes a starter implementation for:

- reading transport details from `E070` and `E07T`
- forwarding a request to a target import queue
- importing that request into the target system

The implementation uses these SAP function modules:

- `TMS_MGR_FORWARD_TR_REQUEST`
- `TMS_MGR_IMPORT_TR_REQUEST`

Because these are SAP standard but not usually treated as public released APIs, ask Basis to validate them in your SAP 2021 landscape before using them for production automation.

## 6. PCMS integration

Set these in PCMS:

- `SAP_TR_MOCK_MODE=false`
- `SAP_TR_READ_URL=<your-service-url>/TransportRequest?$top=200`
- `SAP_TR_USERNAME=<technical-user>`
- `SAP_TR_PASSWORD=<password>`

For movement actions, either:

- expose a custom SAP HTTP endpoint that calls `ZCL_PCMS_TR_ACTIONS`, or
- expose a middleware endpoint that invokes SAP through RFC/HTTP and point `SAP_TR_ACTION_URL` to that endpoint.
