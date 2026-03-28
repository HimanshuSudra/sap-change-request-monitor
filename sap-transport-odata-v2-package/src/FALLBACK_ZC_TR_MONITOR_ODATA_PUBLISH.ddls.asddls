@AbapCatalog.sqlViewName: 'ZVCTRMON'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'Transport Request Monitor - Fallback OData Publish'
@OData.publish: true
define view ZC_TR_MONITOR_PUB
  as select from e070 as Transport
    left outer join e07t as Text
      on Text.trkorr = Transport.trkorr
     and Text.langu  = $session.system_language
{
  key Transport.trkorr      as TransportRequest,
      Transport.strkorr     as ParentRequest,
      Transport.as4user     as CreatedBy,
      Transport.as4date     as CreatedOn,
      Transport.as4time     as CreatedAt,
      Transport.trfunction  as RequestType,
      Transport.trstatus    as RequestStatus,
      Transport.korrdev     as DevelopmentClass,
      Transport.tarsystem   as TargetSystem,
      Text.as4text          as RequestText
}
where Transport.trkorr <> ''
;
