@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'PCMS Transport Monitor Root'
define root view entity ZI_PCMS_TR_MONITOR
  as select from e070 as Transport
    left outer join e07t as Text
      on Text.trkorr = Transport.trkorr
     and Text.langu  = $session.system_language
{
  key Transport.trkorr                         as TransportRequest,
      Transport.strkorr                        as ParentRequest,
      Transport.as4user                        as CreatedBy,
      Transport.as4date                        as CreatedOn,
      Transport.as4time                        as CreatedAt,
      Transport.trfunction                     as RequestType,
      Transport.trstatus                       as RequestStatus,
      Transport.korrdev                        as DevelopmentClass,
      Transport.tarsystem                      as TargetSystem,
      cast( sy-sysid as abap.char(8) )         as SourceSystem,
      cast( sy-mandt as abap.clnt )            as SourceClient,
      Text.as4text                             as RequestText,
      cast( 'DEV_ONLY' as abap.char(20) )      as QaStatus,
      cast( '' as abap.char(14) )              as QaImportedAt,
      cast( '' as abap.char(10) )              as QaReturnCode,
      cast( 'UNKNOWN' as abap.char(20) )       as ProdStatus,
      cast( '' as abap.char(14) )              as ProdImportedAt,
      cast( '' as abap.char(10) )              as ProdReturnCode
}
where Transport.trkorr <> ''
;
