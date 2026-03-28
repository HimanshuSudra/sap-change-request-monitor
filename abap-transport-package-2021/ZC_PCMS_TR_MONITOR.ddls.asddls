@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'PCMS Transport Monitor Projection'
@Metadata.allowExtensions: true
define root view entity ZC_PCMS_TR_MONITOR
  as projection on ZI_PCMS_TR_MONITOR
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
      SourceSystem,
      SourceClient,
      RequestText,
      QaStatus,
      QaImportedAt,
      QaReturnCode,
      ProdStatus,
      ProdImportedAt,
      ProdReturnCode
}
;
