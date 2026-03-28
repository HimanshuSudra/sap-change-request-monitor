# SAP HTTP Wrapper Setup

This class lets PCMS call SAP over HTTP for:

- transport detail lookup
- move transport to QA
- move transport to PROD

## ABAP Class

Create:

- `ZCL_PCMS_TR_HTTP`

This class implements `IF_HTTP_EXTENSION`.

## SICF Service

Create a handler service in SICF, for example:

- `/sap/bc/zpcms/trms`

Assign handler class:

- `ZCL_PCMS_TR_HTTP`

Activate the SICF node.

## HTTP Calls

### 1. Get Transport Details

Method:

- `GET`

Example:

```text
/sap/bc/zpcms/trms?trNumber=DEVK900123
```

### 2. Move to QA

Method:

- `POST`

Body:

```json
{
  "trNumber": "DEVK900123",
  "target": "QA",
  "targetSystem": "QAS",
  "targetClient": "200"
}
```

### 3. Move to PROD

Method:

- `POST`

Body:

```json
{
  "trNumber": "DEVK900123",
  "target": "PROD",
  "targetSystem": "PRD",
  "targetClient": "300"
}
```

## PCMS Mapping

Set:

- `SAP_TR_ACTION_URL=https://<sap-host>/sap/bc/zpcms/trms`

Use the same technical user credentials as the read endpoint unless you decide to separate them.

## Security

- Protect the SICF service with a technical user or SSO.
- Restrict execution to a dedicated role.
- Log every call in SAP and PCMS.
- Do not allow anonymous access.
