# Field Mapping Notes

## Base Tables Used Here

### `E070`

Used for transport/request header details such as:

- request number
- parent request
- owner
- created date/time
- request type
- request status
- development class
- target system

### `E07T`

Used for request text/description.

## Expected Meaning of Key Fields

- `TRKORR`
  Transport/request number
- `STRKORR`
  Parent request/task
- `AS4USER`
  Owner / created by
- `AS4DATE`
  Creation date
- `AS4TIME`
  Creation time
- `TRFUNCTION`
  Workbench/customizing style indicator
- `TRSTATUS`
  Status such as modifiable/released depending on release semantics
- `KORRDEV`
  Development class/package
- `TARSYSTEM`
  Target system
- `AS4TEXT`
  Request description

## Fields You Asked For That May Need Extra SAP Objects

The following are usually not covered cleanly by only `E070` + `E07T`:

- exact current server lane position
- exact source client
- imported to QA
- imported to PROD
- imported by user
- import date/time
- import return code

For these, your SAP Basis team may point you to:

- TMS import history tables/views
- CTS classes or function modules
- a custom ABAP wrapper

## Practical Recommendation

Start with the base OData service in this package first.

Once that endpoint is working, extend it in one of these ways:

1. Add more CDS joins if your release exposes the needed TMS tables cleanly.
2. Create a RAP custom entity for live import status logic.
3. Build a custom class/function wrapper and expose it through a projection/service.
