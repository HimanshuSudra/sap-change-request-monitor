@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Transport Request Monitor - Consumption View'
@Metadata.allowExtensions: true
define view entity ZC_TR_MONITOR
  as projection on ZI_TR_MONITOR
{
  key TransportRequest,
      ParentRequest,
      CreatedBy,
      CreatedOn,
      CreatedAt,
      RequestType,
      RequestStatus,
      DevelopmentClass,
      TargetSystem,
      RequestText
}
;
