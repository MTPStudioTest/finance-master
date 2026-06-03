(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const l of d.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerPolicy&&(d.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?d.credentials="include":r.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function a(r){if(r.ep)return;r.ep=!0;const d=n(r);fetch(r.href,d)}})();const Fn={attention:'<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 4v2"></path><path d="M20 12h-2"></path><path d="M12 20v-2"></path><path d="M4 12h2"></path>',edit:'<path d="M4 16.5V20h3.5L18.2 9.3l-3.5-3.5L4 16.5Z"></path><path d="M12.9 7.1l3.5 3.5"></path>',sprout:'<path d="M12 20v-7"></path><path d="M12 13c-2.8 0-5-2.2-5-5.1 2.8 0 5 2.2 5 5.1Z"></path><path d="M12 13c2.8 0 5-2.2 5-5.1-2.8 0-5 2.2-5 5.1Z"></path>',success:'<path d="m5 12 4 4 10-10"></path>',warning:'<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4.5"></path><path d="M12 16.5h.01"></path>'};window.renderSAGIcon=(e,t={})=>{const n=Fn[e]||Fn.attention,a=t.size?` sag-icon--${t.size}`:"",r=t.tone?` sag-tone-${t.tone}`:"";return`<svg class="sag-icon${a}${r}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g>${n}</g></svg>`};(function(e){function t(I){return String(I).padStart(2,"0")}function n(I,w,j){var J=Number(I),h=Number(w),g=Number(j);if(!Number.isInteger(J)||!Number.isInteger(h)||!Number.isInteger(g))return"";var M=new Date(Date.UTC(J,h-1,g,12,0,0,0));return M.getUTCFullYear()!==J||M.getUTCMonth()!==h-1||M.getUTCDate()!==g?"":J+"-"+t(h)+"-"+t(g)}function a(I){var w=String(I||"").trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(w))return!1;var j=w.split("-").map(Number);return n(j[0],j[1],j[2])===w}function r(I){if(I==null||I==="")return"";if(typeof I=="number"||Object.prototype.toString.call(I)==="[object Date]"){var w=new Date(I);return Number.isFinite(w.getTime())?n(w.getUTCFullYear(),w.getUTCMonth()+1,w.getUTCDate()):""}var j=String(I).trim();if(a(j))return j;var J=Date.parse(j);if(!Number.isFinite(J))return"";var h=new Date(J);return n(h.getUTCFullYear(),h.getUTCMonth()+1,h.getUTCDate())}function d(){var I=new Date;return n(I.getFullYear(),I.getMonth()+1,I.getDate())}function l(I){var w=r(I);return w?w+"T12:00:00.000Z":new Date().toISOString()}function u(I,w){var j=r(I);if(!j)return"";var J=j.split("-").map(Number),h=new Date(Date.UTC(J[0],J[1]-1,J[2]+(Number(w)||0),12,0,0,0));return n(h.getUTCFullYear(),h.getUTCMonth()+1,h.getUTCDate())}function S(I){var w=r(I);return w?w.slice(0,7):""}function b(I,w){var j=r(I),J=r(w);return!j||!J?0:j<J?-1:j>J?1:0}e.FinanceDates={addDaysDateOnly:u,compareDateOnly:b,dateOnlyFromParts:n,dateOnlyToNoonIso:l,isDateOnly:a,monthKey:S,todayDateOnly:d,toDateOnly:r}})(typeof window<"u"?window:globalThis);(function(e){var t=["income.received","expense.recorded","expense.recurring_set","obligation.reviewed","debt.added","debt.payment_made","invoice.sent","invoice.paid","pipeline.created","pipeline.stage_changed","pipeline.value_changed","pipeline.probability_changed","transaction.reviewed","debt.plan_updated","transfer.recorded","cash.adjusted"],n=["balance.opening_set","asset.account_set","asset.position_set","asset.defi_set","asset.reserve_set","asset.reserve_allocated","finance.event_reversed"],a=t.concat(n);function r(E){if(E!==void 0)try{return JSON.parse(JSON.stringify(E))}catch{return E}}function d(E){var C=Number(E);return Number.isFinite(C)?Math.round(C*100)/100:0}function l(){try{if(e.crypto&&typeof e.crypto.randomUUID=="function")return e.crypto.randomUUID()}catch{}return"fin-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10)}function u(E,C){var N=String(E||C||"EUR").trim().toUpperCase();return N||"EUR"}function S(E){var C=Number(E);return!Number.isFinite(C)||C<0?0:C>1?1:C}function b(E){return a.indexOf(String(E||"").trim())!==-1}function I(E){if(typeof E!="string"||!E.trim())return!1;var C=Date.parse(E);return Number.isFinite(C)?E.indexOf("T")!==-1:!1}function w(E){return I(E)?new Date(E).toISOString():null}function j(E,C){var N=Date.parse(E);if(!Number.isFinite(N))return null;var R=new Date(N);try{var te=new Intl.DateTimeFormat("en-CA",{timeZone:C||void 0,year:"numeric",month:"2-digit",day:"2-digit"}),de=te.formatToParts(R),ve=de.find(function(ie){return ie.type==="year"}),Q=de.find(function(ie){return ie.type==="month"}),P=de.find(function(ie){return ie.type==="day"});if(ve&&Q&&P)return ve.value+"-"+Q.value+"-"+P.value}catch{}var x=R.getFullYear(),B=String(R.getMonth()+1).padStart(2,"0"),Y=String(R.getDate()).padStart(2,"0");return x+"-"+B+"-"+Y}function J(E){var C=Number(E);return Number.isFinite(C)?Math.round(C*100):0}function h(E){var C=Number(E);return Number.isFinite(C)?Math.round(C)/100:0}function g(E){var C=Array.isArray(E)?E.slice():[];return C.sort(function(N,R){var te=Date.parse(N&&N.timestamp?N.timestamp:"")||0,de=Date.parse(R&&R.timestamp?R.timestamp:"")||0;if(te!==de)return te-de;var ve=Date.parse(N&&N.created_at?N.created_at:"")||0,Q=Date.parse(R&&R.created_at?R.created_at:"")||0;if(ve!==Q)return ve-Q;var P=String(N&&N.id||""),x=String(R&&R.id||"");return P.localeCompare(x)})}function M(E,C){var N=C||{},R=E&&typeof E=="object"?E:{},te=String(R.type||"").trim();if(!b(te))throw new Error("Invalid financial event type: "+te);var de=Number(R.amount);if(!Number.isFinite(de))throw new Error("Financial event amount must be a finite number.");var ve=w(N.nowIso)||new Date().toISOString(),Q=w(R.timestamp);if(!Q&&N.allowApproximateTimestamp){var P=R.timestamp||R.created_at||ve,x=Date.parse(P);Number.isFinite(x)&&(Q=new Date(x).toISOString())}if(!Q)throw new Error("Financial event timestamp is required and must be ISO-8601.");var B={id:String(R.id||l()),timestamp:Q,type:te,amount:d(de),currency:u(R.currency,N.baseCurrency),metadata:r(R.metadata&&typeof R.metadata=="object"?R.metadata:{}),created_at:w(R.created_at)||ve};return R.related_entity_id!=null&&String(R.related_entity_id).trim()&&(B.related_entity_id=String(R.related_entity_id).trim()),R.updated_at&&I(R.updated_at)&&(B.updated_at=new Date(R.updated_at).toISOString()),!R.timestamp&&N.allowApproximateTimestamp&&(B.metadata.approximateTimestamp=!0),B}function F(E){var C=new Set,N=g(E);return N.forEach(function(R){if(!(!R||R.type!=="finance.event_reversed")){var te=R.related_entity_id||R.metadata&&R.metadata.reversed_event_id||R.metadata&&R.metadata.event_id||null;te&&C.add(String(te))}}),C}var W={REQUIRED_EVENT_TYPES:t,SUPPLEMENTAL_EVENT_TYPES:n,ALL_EVENT_TYPES:a,deepClone:r,roundMoney:d,createId:l,normalizeCurrency:u,clampProbability:S,isValidEventType:b,isIsoTimestamp:I,localDateKey:j,toMinor:J,fromMinor:h,sortFinancialEvents:g,createFinancialEvent:M,resolveReversedEventIds:F};typeof module<"u"&&module.exports&&(module.exports=W),e.FinanceEvents=W})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!t)throw new Error("FinanceEvents is required before FinanceLedger.");function n(h){return Array.isArray(h)?h:[]}function a(h){var g=h&&typeof h=="object"?h:{};return{baseCurrency:t.normalizeCurrency(g.baseCurrency,"EUR"),forecastDays:Number.isFinite(Number(g.forecastDays))?Math.max(1,Math.floor(Number(g.forecastDays))):90,nowIso:t.isIsoTimestamp(g.nowIso)?new Date(g.nowIso).toISOString():new Date().toISOString()}}function r(h){var g=String(h||"monthly").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return g==="week"?"weekly":g==="two_weekly"||g==="every_two_weeks"||g==="fortnightly"?"biweekly":g==="month"?"monthly":g==="quarter"?"quarterly":g==="annual"||g==="annually"?"yearly":["weekly","biweekly","monthly","quarterly","yearly"].includes(g)?g:"monthly"}function d(h,g){var M=Math.abs(Number(h)||0),F=r(g);return F==="weekly"?t.roundMoney(M*52/12):F==="biweekly"?t.roundMoney(M*26/12):F==="quarterly"?t.roundMoney(M/3):F==="yearly"?t.roundMoney(M/12):t.roundMoney(M)}function l(h,g){var M=t.normalizeCurrency(h&&h.currency,g);if(M!==t.normalizeCurrency(g,"EUR"))throw new Error("Event currency must match base currency ("+g+").")}function u(h,g,M,F){var W=a(M),E=F||{},C=n(h).slice(),N=[];return n(g).forEach(function(R){if(!(!R||typeof R!="object")){l(R,W.baseCurrency);var te=t.createFinancialEvent(R,{baseCurrency:W.baseCurrency,nowIso:E.nowIso||W.nowIso,allowApproximateTimestamp:!!E.allowApproximateTimestamp});C.push(te),N.push(te)}}),{events:t.sortFinancialEvents(C),appended:N}}function S(h,g,M,F,W){var E=t.sortFinancialEvents(h),C=E.find(function(R){return R&&String(R.id)===String(g)});if(!C)throw new Error("Cannot reverse missing finance event: "+g);var N={type:"finance.event_reversed",amount:0,currency:C.currency||F&&F.baseCurrency||"EUR",related_entity_id:String(C.id),timestamp:W&&W.timestamp||F&&F.nowIso||new Date().toISOString(),metadata:{reason:String(M||"undo"),reversed_event_id:String(C.id)}};return u(h,[N],F,W)}function b(h){var g=t.sortFinancialEvents(h),M=t.resolveReversedEventIds(g);return g.filter(function(F){return!F||F.type==="finance.event_reversed"?!1:!M.has(String(F.id))})}function I(h){var g=String(h||"").toLowerCase();return g!=="paid"&&g!=="closed"&&g!=="lost"&&g!=="cancelled"&&g!=="deleted"}function w(h){return t.toDateOnly?t.toDateOnly(h):e.FinanceDates?e.FinanceDates.toDateOnly(h):""}function j(h,g){var M=a(g),F=M.nowIso,W=Date.parse(F),E=720*60*60*1e3,C=b(h),N=Object.create(null),R=Object.create(null),te=Object.create(null),de=Object.create(null),ve=Object.create(null),Q=Object.create(null),P=Object.create(null),x=Object.create(null),B=Object.create(null),Y=Object.create(null),ie=[],X=0;C.forEach(function(f){var i=f.metadata&&typeof f.metadata=="object"?f.metadata:{},$=String(f.related_entity_id||i.entity_id||i.id||f.id),ne=Number(f.amount)||0,Me=Date.parse(f.timestamp),Ae=Number.isFinite(Me)?Math.max(0,W-Me):Number.POSITIVE_INFINITY;if(f.type==="income.received"||f.type==="expense.recorded"||f.type==="transfer.recorded"||f.type==="cash.adjusted"){var xe=String(i.direction||"").trim(),he=ne;f.type==="expense.recorded"&&(xe="out"),f.type==="income.received"&&(xe="in"),f.type==="transfer.recorded"&&(xe="transfer"),f.type==="cash.adjusted"&&(xe=xe==="decrease"?"out":"in"),(f.type==="expense.recorded"||f.type==="cash.adjusted"&&xe==="out")&&(he=-Math.abs(ne)),ie.push({id:f.id,transactionEntityId:$,type:f.type,ledgerType:String(i.ledgerType||(f.type==="income.received"?"income":f.type==="expense.recorded"?"expense":f.type==="transfer.recorded"?"transfer":"adjustment")),direction:xe,description:String(i.description||f.type),amount:ne,signedAmount:he,currency:f.currency,accountId:String(i.accountId||"").trim(),accountName:String(i.accountName||"").trim(),fromAccountId:String(i.fromAccountId||"").trim(),fromAccountName:String(i.fromAccountName||"").trim(),toAccountId:String(i.toAccountId||"").trim(),toAccountName:String(i.toAccountName||"").trim(),categoryId:String(i.categoryId||"uncategorized"),scope:String(i.scope||"shared"),source:String(i.source||"manual"),importBatchId:String(i.importBatchId||"").trim(),fingerprint:String(i.fingerprint||"").trim(),obligationId:String(i.obligationId||"").trim(),obligationDueDate:String(i.obligationDueDate||"").trim(),obligationTitle:String(i.obligationTitle||"").trim(),linkedIncomeId:String(i.invoiceId||i.pipelineId||i.linkedIncomeId||"").trim(),reviewStatus:String(i.reviewStatus||"").trim()||(String(i.categoryId||"uncategorized").toLowerCase()==="uncategorized"?"needs_review":"clear"),reviewNotes:"",timestamp:f.timestamp})}if(f.type==="income.received"&&Ae<=E&&(X+=t.toMinor(ne)),f.type==="pipeline.created"){N[$]={id:$,title:String(i.title||i.name||i.client||"Pipeline Item"),value:Number.isFinite(Number(i.value))?Number(i.value):ne,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||f.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:f.currency,createdAt:f.timestamp,updatedAt:f.timestamp};return}if(f.type==="pipeline.stage_changed"){N[$]||(N[$]={id:$,title:String(i.title||i.name||"Pipeline Item"),value:0,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||f.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:f.currency,createdAt:f.timestamp,updatedAt:f.timestamp}),N[$].status=String(i.stage||i.status||N[$].status||"open"),N[$].scope=String(i.scope||N[$].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(N[$].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),(i.title||i.name)&&(N[$].title=String(i.title||i.name)),i.scenarioInclusion&&(N[$].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(N[$].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(N[$].destinationAccountName=String(i.destinationAccountName||"").trim()),N[$].updatedAt=f.timestamp;return}if(f.type==="pipeline.value_changed"){N[$]||(N[$]={id:$,title:String(i.title||i.name||"Pipeline Item"),value:0,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||f.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:f.currency,createdAt:f.timestamp,updatedAt:f.timestamp}),N[$].value=Number.isFinite(Number(i.value))?Number(i.value):ne,N[$].scope=String(i.scope||N[$].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(N[$].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),(i.title||i.name)&&(N[$].title=String(i.title||i.name)),i.scenarioInclusion&&(N[$].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(N[$].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(N[$].destinationAccountName=String(i.destinationAccountName||"").trim()),N[$].updatedAt=f.timestamp;return}if(f.type==="pipeline.probability_changed"){N[$]||(N[$]={id:$,title:String(i.title||i.name||"Pipeline Item"),value:Number.isFinite(Number(i.value))?Number(i.value):ne,probability:1,status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||f.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:f.currency,createdAt:f.timestamp,updatedAt:f.timestamp}),N[$].probability=t.clampProbability(i.probability!=null?i.probability:ne),N[$].scope=String(i.scope||N[$].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(N[$].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),i.scenarioInclusion&&(N[$].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(N[$].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(N[$].destinationAccountName=String(i.destinationAccountName||"").trim()),N[$].updatedAt=f.timestamp;return}if(f.type==="invoice.sent"){R[$]={id:$,client:String(i.client||i.title||i.name||"Invoice"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,expectedDate:w(i.expectedDate||i.expectedDateISO||f.timestamp),status:String(i.status||"Sent"),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),currency:f.currency,sentAt:f.timestamp,paidAt:null};return}if(f.type==="invoice.paid"){R[$]||(R[$]={id:$,client:String(i.client||i.title||i.name||"Invoice"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,expectedDate:w(i.expectedDate||i.expectedDateISO||f.timestamp),status:"Paid",destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),currency:f.currency,sentAt:f.timestamp,paidAt:f.timestamp}),R[$].status="Paid",R[$].paidAt=f.timestamp,R[$].scope=String(i.scope||R[$].scope||"shared"),Number.isFinite(Number(i.amount))&&(R[$].amount=Number(i.amount)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(R[$].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(R[$].destinationAccountName=String(i.destinationAccountName||"").trim());return}if(f.type==="expense.recurring_set"){var mt=r(i.frequency),pt=Number.isFinite(Number(i.amount))?Math.abs(Number(i.amount)):Math.abs(ne),Pe=Number.isFinite(Number(i.monthlyAmount))?Math.abs(Number(i.monthlyAmount)):d(pt,mt);te[$]={id:$,category:String(i.category||i.name||"Recurring Expense"),amount:pt,monthlyAmount:Pe,essential:!!i.essential,active:i.active!==!1,dueDay:Math.max(1,Math.min(28,Number(i.dueDay)||1)),frequency:mt,linkedDebtId:String(i.linkedDebtId||i.debtId||"").trim(),scope:String(i.scope||"shared"),currency:f.currency,updatedAt:f.timestamp};return}if(f.type==="obligation.reviewed"){de[$]={id:$,status:String(i.status||"needs_review").toLowerCase(),title:String(i.title||"Obligation"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,dueDate:String(i.dueDate||""),paidAt:String(i.paidAt||""),deferredUntil:String(i.deferredUntil||""),accountId:String(i.accountId||""),accountName:String(i.accountName||""),transactionId:String(i.transactionId||""),notes:String(i.notes||""),reviewedAt:f.timestamp,currency:f.currency,scope:String(i.scope||"shared")};return}if(f.type==="transaction.reviewed"){ve[$]={id:$,categoryId:String(i.categoryId||"").trim(),scope:String(i.scope||"").trim(),reviewStatus:String(i.reviewStatus||"reviewed").trim(),notes:String(i.notes||""),obligationId:String(i.obligationId||"").trim(),obligationTitle:String(i.obligationTitle||"").trim(),reviewedAt:f.timestamp};return}if(f.type==="debt.added"||f.type==="debt.payment_made"||f.type==="debt.plan_updated"){Q[$]||(Q[$]={id:$,name:String(i.name||i.lender||"Debt"),totalAdded:0,totalPaid:0,outstanding:0,dueDate:"",minimumPayment:0,minimumPaymentMonthly:0,paymentPlanNote:"",planType:"regular",frequency:"monthly",installments:[],planReviewedAt:"",scope:String(i.scope||"shared"),currency:f.currency,updatedAt:f.timestamp}),f.type==="debt.added"?(Q[$].totalAdded+=Math.max(0,ne),i.dueDate&&(Q[$].dueDate=w(i.dueDate)),Number.isFinite(Number(i.minimumPayment))&&(Q[$].minimumPayment=Math.max(0,Number(i.minimumPayment))),i.paymentPlanNote&&(Q[$].paymentPlanNote=String(i.paymentPlanNote)),Q[$].frequency=r(i.frequency||Q[$].frequency)):f.type==="debt.payment_made"?Q[$].totalPaid+=Math.max(0,ne):(i.dueDate&&(Q[$].dueDate=w(i.dueDate)),Q[$].minimumPayment=Math.max(0,Number(i.minimumPayment)||0),Q[$].paymentPlanNote=String(i.paymentPlanNote||""),Q[$].planType=String(i.planType||"regular"),Q[$].frequency=r(i.frequency),Q[$].installments=Array.isArray(i.installments)?i.installments:[],Q[$].planReviewedAt=f.timestamp),Q[$].outstanding=Math.max(0,Q[$].totalAdded-Q[$].totalPaid),Q[$].minimumPaymentMonthly=d(Q[$].minimumPayment,Q[$].frequency),Q[$].scope=String(i.scope||Q[$].scope||"shared"),Q[$].updatedAt=f.timestamp;return}if(f.type==="asset.account_set"){P[$]={id:$,name:String(i.name||"Account"),balance:Number.isFinite(Number(i.balance))?Number(i.balance):ne,currency:f.currency,active:i.active!==!1,scope:String(i.scope||"shared"),bucket:String(i.bucket||i.reserveBucket||"available"),reserved:!!i.reserved||i.bucket&&String(i.bucket)!=="available",updatedAt:f.timestamp};return}if(f.type==="asset.position_set"){x[$]={id:$,symbolOrName:String(i.symbolOrName||i.symbol||"TOKEN"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):0,price:Number.isFinite(Number(i.price))?Number(i.price):0,liquidity:String(i.liquidity||"med"),chain:String(i.chain||"Unknown"),scope:String(i.scope||"shared"),priceSource:String(i.priceSource||"manual"),priceUpdatedAt:String(i.priceUpdatedAt||f.timestamp),manualPriceOverride:i.manualPriceOverride!==!1,updatedAt:f.timestamp};return}if(f.type==="asset.defi_set"){B[$]={id:$,protocol:String(i.protocol||i.name||"Protocol"),collateralValue:Number.isFinite(Number(i.collateralValue))?Number(i.collateralValue):0,debtValue:Number.isFinite(Number(i.debtValue))?Number(i.debtValue):0,riskScore:String(i.riskScore||"Low"),scope:String(i.scope||"shared"),updatedAt:f.timestamp};return}if(f.type==="asset.reserve_set"){Y[$]={id:$,name:String(i.name||"Reserve"),targetAmount:Number.isFinite(Number(i.targetAmount))?Number(i.targetAmount):ne,currentAmount:Number.isFinite(Number(i.currentAmount))?Number(i.currentAmount):ne,linkedCashAccountId:String(i.linkedCashAccountId||"").trim()||null,purpose:String(i.purpose||"custom"),priority:String(i.priority||"medium"),scope:String(i.scope||"shared"),notes:String(i.notes||""),active:i.active!==!1,updatedAt:f.timestamp};return}if(f.type==="asset.reserve_allocated"){if(!Y[$])return;Number.isFinite(Number(i.currentAmount))?Y[$].currentAmount=Number(i.currentAmount):Number.isFinite(ne)&&(Y[$].currentAmount=ne),Y[$].updatedAt=f.timestamp;return}});var Ce=Object.keys(N).map(function(f){return N[f]}),be=Object.keys(te).map(function(f){return te[f]}),fe=Object.keys(de).map(function(f){return de[f]}),$e=be.filter(function(f){return f&&f.active!==!1}),K=Object.keys(Q).map(function(f){return Q[f]}),ye=Object.keys(R).map(function(f){return R[f]});Object.keys(Y).map(function(f){return Y[f]});var q=Object.create(null);Object.keys(de).forEach(function(f){var i=de[f];i&&i.transactionId&&(q[String(i.transactionId)]=i)}),ie=ie.map(function(f){var i=ve[String(f.id)]||ve[String(f.transactionEntityId)]||null,$=q[String(f.id)]||q[String(f.transactionEntityId)]||null,ne=i&&i.categoryId?i.categoryId:f.categoryId,Me=i&&i.scope?i.scope:f.scope,Ae=f.obligationId||i&&i.obligationId||$&&$.id||"";return Object.assign({},f,{categoryId:ne,scope:Me,obligationId:Ae,obligationTitle:f.obligationTitle||i&&i.obligationTitle||$&&$.title||"",reviewStatus:i&&i.reviewStatus?i.reviewStatus:String(ne||"").toLowerCase()==="uncategorized"?"needs_review":Ae?"reviewed":f.reviewStatus,reviewNotes:i&&i.notes?i.notes:f.reviewNotes})}),ie.sort(function(f,i){return(Date.parse(i.timestamp||"")||0)-(Date.parse(f.timestamp||"")||0)}),Ce.sort(function(f,i){var $=Date.parse(f.expectedDateISO||"")||0,ne=Date.parse(i.expectedDateISO||"")||0;return $!==ne?$-ne:String(f.id).localeCompare(String(i.id))}),ye.sort(function(f,i){var $=Date.parse(f.expectedDate||"")||0,ne=Date.parse(i.expectedDate||"")||0;return $!==ne?$-ne:String(f.id).localeCompare(String(i.id))});var tt=$e.reduce(function(f,i){return f+(Number(i.monthlyAmount)||0)},0),We=Ce.filter(function(f){return I(f.status)}).reduce(function(f,i){return f+(Number(i.value)||0)*t.clampProbability(i.probability)},0),Ye=new Date(W);Ye.setDate(Ye.getDate()+M.forecastDays);var Qe=Ce.filter(function(f){return I(f.status)}).filter(function(f){var i=Date.parse(f.expectedDateISO||"");return Number.isFinite(i)?i>=W&&i<=Ye.getTime():!1}).reduce(function(f,i){return f+(Number(i.value)||0)*t.clampProbability(i.probability)},0),_e=K.reduce(function(f,i){return f+Math.max(0,Number(i.outstanding)||0)},0),ct=Object.keys(P).map(function(f){return P[f]}).filter(function(f){return f&&f.active!==!1}),pe=Object.keys(x).map(function(f){return x[f]}),ut=Object.keys(B).map(function(f){return B[f]});return{currency:M.baseCurrency,asOf:M.nowIso,eventsCount:C.length,pipelineDeals:Ce,recurringExpenses:$e,obligationReviews:fe,debtAccounts:K,invoices:ye,transactions:ie,fiatAccounts:ct,web3Positions:pe,defiPositions:ut,recurringMonthlyTotal:t.roundMoney(tt),weightedPipeline:t.roundMoney(We),expectedPipeline90d:t.roundMoney(Qe),debtTotal:t.roundMoney(_e),incomeReceivedLast30Days:t.fromMinor(X),monthlyIncomeEstimate:t.roundMoney(t.fromMinor(X)+Qe),invoicesSentCount:ye.filter(function(f){return String(f.status||"").toLowerCase()!=="paid"}).length,openPipelineCount:Ce.filter(function(f){return I(f.status)}).length}}var J={normalizeSettings:a,appendEvents:u,reverseEvent:S,getActiveEvents:b,buildReadModel:j,isPipelineActive:I,normalizeFrequency:r,normalizeRecurrenceMonthlyAmount:d};typeof module<"u"&&module.exports&&(module.exports=J),e.FinanceLedger=J})(typeof window<"u"?window:globalThis);(function(e){function t(d){var l=Number(d);return Number.isFinite(l)?Math.round(l*100)/100:0}function n(d,l,u){var S=Number.isFinite(Number(u))?Number(u):.01;return Math.abs((Number(d)||0)-(Number(l)||0))<=S}function a(d){var l=d&&typeof d=="object"?d:{},u=l.snapshot&&typeof l.snapshot=="object"?l.snapshot:{},S=l.components&&typeof l.components=="object"?l.components:{},b=[],I=t(S.realBalanceFromSums);if(n(u.realBalance,I,.01)||b.push({id:"real-balance-consistency",message:"Real balance does not match ledger sums.",expected:I,actual:t(u.realBalance),severity:"high"}),u.monthlyBurn==null)u.runwayMonths!==null&&b.push({id:"runway-null-when-burn-missing",message:"Runway must be null when monthly burn is undefined.",expected:null,actual:u.runwayMonths,severity:"medium"});else if(Number(u.monthlyBurn)===0)u.runwayMonths!==null&&b.push({id:"runway-null-when-burn-zero",message:"Runway must be null when monthly burn is zero.",expected:null,actual:u.runwayMonths,severity:"medium"});else{var w=Number.isFinite(Number(u.availableCash))?Number(u.availableCash):Number.isFinite(Number(u.trulyAvailableCash))?Number(u.trulyAvailableCash):Number(u.realBalance),j=t((w||0)/(Number(u.monthlyBurn)||1));n(u.runwayMonths,j,.01)||b.push({id:"runway-formula",message:"Runway is inconsistent with available cash / burn.",expected:j,actual:t(u.runwayMonths),severity:"high"})}var J=t(S.weightedPipelineFromDeals);n(u.weightedPipeline,J,.01)||b.push({id:"pipeline-sum-consistency",message:"Weighted pipeline does not match deal list.",expected:J,actual:t(u.weightedPipeline),severity:"high"});var h=t(S.totalDebtFromLiabilities);return n(u.totalDebt,h,.01)||b.push({id:"debt-total-consistency",message:"Debt total does not match liability ledger.",expected:h,actual:t(u.totalDebt),severity:"high"}),{ok:b.length===0,violations:b,messages:b.map(function(g){return g.message})}}var r={evaluateFinancialInvariants:a};typeof module<"u"&&module.exports&&(module.exports=r),e.FinanceInvariants=r})(typeof window<"u"?window:globalThis);(function(e){function t(l){var u=Number(l);return!Number.isFinite(u)||u<0?0:u>1?1:u}function n(l){var u=t(l);return u>=.75?"HIGH":u>=.45?"MEDIUM":"LOW"}function a(l){var u=new Set,S=[];return(Array.isArray(l)?l:[]).forEach(function(b){var I=String(b||"").trim();!I||u.has(I)||(u.add(I),S.push(I))}),S}function r(l){var u=l&&typeof l=="object"?l:{},S=1,b=[],I=[];u.missingRecurringExpenses&&(S-=.12,b.push("recurring expenses"),I.push("Missing recurring expenses configuration.")),u.noRecentData&&(S-=.15,b.push("recent financial activity"),I.push("No recent finance data in last 30 days.")),u.undefinedBurn&&(S-=.25,b.push("monthly burn"),I.push("Monthly burn is undefined.")),u.emptyPipeline&&(S-=.1,b.push("pipeline"),I.push("Pipeline is empty.")),u.staleCompute&&(S-=.08,b.push("compute freshness"),I.push("Snapshot is stale versus latest event timestamp."));var w=Array.isArray(u.invariantViolations)?u.invariantViolations.length:0;return w>0&&(S-=Math.min(.4,w*.1),I.push("Invariant checks reported "+w+" violation(s).")),S=t(S),{score:S,level:n(S),missingInputs:a((u.missingInputs||[]).concat(b)),reasons:I}}var d={clamp01:t,confidenceLevel:n,computeConfidenceScore:r};typeof module<"u"&&module.exports&&(module.exports=d),e.FinanceConfidence=d})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceInvariants,r=e.FinanceConfidence;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./invariants.js")),!r&&typeof module<"u"&&module.exports&&(r=require("./confidence.js")),!t||!n||!a||!r)throw new Error("FinanceCompute dependencies are missing.");function d(P){return n.normalizeSettings(P||{})}function l(P){return Array.isArray(P)?P:[]}function u(P,x,B){var Y=Date.parse(P);if(!Number.isFinite(Y))return!1;var ie=x-Y;return ie>=0&&ie<=B*24*60*60*1e3}function S(P,x,B){var Y=Date.parse(P);return Number.isFinite(Y)?Y>=x&&Y<=B:!1}function b(P){return n.isPipelineActive(P)}function I(P,x){var B=Number(P);return Number.isFinite(B)?B:Number.isFinite(Number(x))?Number(x):0}function w(P){return t.roundMoney(P)}var j=["tax_reserve","vat_reserve","health_insurance","debt_repayment","personal_survival","business_operating_costs","investment_growth","buffer"];function J(P){var x=String(P||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return x?x==="tax"||x==="taxes"?"tax_reserve":x==="vat"?"vat_reserve":x==="health"||x==="insurance"?"health_insurance":x==="debt"?"debt_repayment":x==="survival"?"personal_survival":x==="business"||x==="operating"?"business_operating_costs":x==="growth"||x==="investment"?"investment_growth":x==="safety_buffer"||x==="safety"?"buffer":x:"available"}function h(P){var x={available:"Available",tax_reserve:"Tax reserve",vat_reserve:"VAT reserve",health_insurance:"Health insurance",debt_repayment:"Debt repayment",personal_survival:"Personal survival",business_operating_costs:"Business operating costs",investment_growth:"Investment growth",buffer:"Buffer"};return x[P]||String(P||"available").replace(/_/g," ")}function g(P,x){var B=e.FinanceDates&&e.FinanceDates.toDateOnly(P);if(B&&e.FinanceDates&&e.FinanceDates.addDaysDateOnly)return new Date(e.FinanceDates.dateOnlyToNoonIso(e.FinanceDates.addDaysDateOnly(B,x)));var Y=new Date(P);return Y.setUTCDate(Y.getUTCDate()+x),Y}function M(P){return e.FinanceDates&&e.FinanceDates.toDateOnly?e.FinanceDates.toDateOnly(P):""}function F(P){var x=new Date(P);return new Date(x.getFullYear(),x.getMonth(),1,0,0,0,0)}function W(P){var x=new Date(P);return new Date(x.getFullYear(),x.getMonth()+1,0,23,59,59,999)}function E(P){var x=String(P&&P.status||"").toLowerCase(),B=t.clampProbability(P&&P.probability);return x==="received"||x==="paid"?"received":x==="cancelled"||x==="lost"||x==="closed"?"cancelled":x==="confirmed"||x==="signed"||B>=.8?"confirmed":x==="risky"||x==="open"||B<.5?"risky":"expected"}function C(P,x){var B=M(P),Y=M(x);if(!B||!Y)return"needs_review";if(B<Y)return"overdue";var ie=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(Y,7):M(g(x,7));return B<=ie?"due_soon":"upcoming"}function N(P,x,B,Y,ie){return{key:P,label:x,value:w(Number(B)||0),parts:l(Y).map(function(X){return{label:String(X&&X.label||""),value:w(Number(X&&X.value)||0),operation:X&&X.operation?String(X.operation):void 0}}),warnings:l(ie).map(function(X){return String(X||"")}).filter(Boolean)}}function R(P){var x=Object.create(null);return l(P).forEach(function(B){if(String(B&&B.type)==="income.received"){var Y=String(B&&B.linkedIncomeId||"").trim();Y&&(x[Y]=!0)}}),x}function te(P,x,B,Y){var ie=l(P.fiatAccounts),X=l(P.recurringExpenses),Ce=Object.create(null);l(P.obligationReviews).forEach(function(s){!s||!s.id||(Ce[String(s.id)]=s)});var be=l(P.transactions),fe=R(be),$e=l(P.pipelineDeals).filter(function(s){return b(s&&s.status)&&fe[String(s&&s.id||"")]!==!0}),K=l(P.debtAccounts),ye=Object.create(null),q=K.filter(function(s){var k=Number(s&&s.outstanding)||0,se=Number(s&&s.minimumPaymentMonthly)||Number(s&&s.minimumPayment)||0;return k<=0||se<=0?!1:(ye[String(s&&s.id||"")]=!0,!0)}),tt=X.filter(function(s){var k=String(s&&s.linkedDebtId||"").trim();return!k||ye[k]!==!0}),We=F(Y).getTime(),Ye=W(Y).getTime(),Qe=g(Y,B.forecastDays).getTime(),_e=Object.create(null),ct=0,pe=0;ie.forEach(function(s){var k=Number(s&&s.balance)||0,se=J(s&&s.bucket),ke=se!=="available"||!!(s&&s.reserved);ct+=k,ke&&(pe+=k,_e[se]||(_e[se]={bucket:se,label:h(se),amount:0}),_e[se].amount+=k)}),j.forEach(function(s){_e[s]||(_e[s]={bucket:s,label:h(s),amount:0})});var ut=Object.keys(_e).map(function(s){return{bucket:s,label:_e[s].label,amount:w(_e[s].amount)}}).sort(function(s,k){var se=j.indexOf(s.bucket),ke=j.indexOf(k.bucket);return se!==ke?(se===-1?999:se)-(ke===-1?999:ke):String(s.label).localeCompare(String(k.label))}),f=tt.filter(function(s){return String(s&&s.scope||"").toLowerCase()==="personal"||String(s&&s.scope||"").toLowerCase()==="shared"}).reduce(function(s,k){return s+(Number(k&&k.monthlyAmount)||0)},0),i=tt.filter(function(s){return String(s&&s.scope||"").toLowerCase()==="business"||String(s&&s.scope||"").toLowerCase()==="shared"}).reduce(function(s,k){return s+(Number(k&&k.monthlyAmount)||0)},0);q.forEach(function(s){var k=Number(s&&s.minimumPaymentMonthly)||Number(s&&s.minimumPayment)||0,se=String(s&&s.scope||"shared").toLowerCase();(se==="personal"||se==="shared")&&(f+=k),(se==="business"||se==="shared")&&(i+=k)});var $=tt.reduce(function(s,k){return s+(Number(k&&k.monthlyAmount)||0)},0),ne=q.reduce(function(s,k){return s+(Number(k&&k.minimumPaymentMonthly)||Number(k&&k.minimumPayment)||0)},0),Me=$+ne,Ae=[],xe=M(Y),he=xe?xe.split("-").map(Number):[],mt=M(Qe),pt=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(xe,-30):M(g(Y,-30));tt.forEach(function(s){for(var k=Math.max(1,Math.min(28,Number(s&&s.dueDay)||1)),se=0;se<4;se+=1){var ke=new Date(Date.UTC(he[0]||new Date(Y).getUTCFullYear(),(he[1]||new Date(Y).getUTCMonth()+1)-1+se,k,12,0,0,0)),It=e.FinanceDates&&e.FinanceDates.dateOnlyFromParts?e.FinanceDates.dateOnlyFromParts(ke.getUTCFullYear(),ke.getUTCMonth()+1,ke.getUTCDate()):ke.toISOString().slice(0,10);if(!(mt&&It>mt)&&(se>0||!pt||It>=pt)){var c=String(s&&s.id||"expense")+"-"+It.slice(0,7),o=Ce[c]||null,m=It,y=C(It,Y);o&&o.status==="paid"?y="paid":o&&o.status==="deferred"&&o.deferredUntil?(m=M(o.deferredUntil)||m,y=C(m,Y)):o&&o.status==="needs_review"&&(y="needs_review"),Ae.push({id:c,sourceId:String(s&&s.id||"expense"),title:String(s&&s.category||"Recurring cost"),type:"recurring_cost",amount:w(Number(s&&s.monthlyAmount)||0),dueDate:m,originalDueDate:It,status:y,review:o,scope:String(s&&s.scope||"shared")})}}}),K.forEach(function(s){var k=Number(s&&s.outstanding)||0;if(!(k<=0)){var se=M(s&&s.dueDate),ke=(Number(s&&s.minimumPayment)||0)>0;Ae.push({id:String(s&&s.id||"debt"),title:String(s&&s.name||"Debt repayment"),type:"debt",amount:w((Number(s&&s.minimumPayment)||0)>0?Number(s&&s.minimumPayment):k),dueDate:se,status:ke?C(se,Y):"needs_review",scope:String(s&&s.scope||"shared")})}}),Ae.sort(function(s,k){var se=Date.parse(s.dueDate||"")||Number.MAX_SAFE_INTEGER,ke=Date.parse(k.dueDate||"")||Number.MAX_SAFE_INTEGER;return se-ke});var Pe=$e.map(function(s){var k=E(s);return{id:String(s&&s.id||""),title:String(s&&s.title||"Income"),amount:w(Number(s&&s.value)||0),dueDate:M(s&&s.expectedDateISO),status:k,probability:t.clampProbability(s&&s.probability),scope:String(s&&s.scope||"shared")}}).filter(function(s){return s.status!=="received"&&s.status!=="cancelled"}),Ne={confirmed:0,expected:0,risky:0,received:0};Pe.forEach(function(s){var k=Date.parse(s.dueDate||"");!Number.isFinite(k)||k<We||k>Ye||(s.status==="confirmed"&&(Ne.confirmed+=s.amount),s.status==="expected"&&(Ne.expected+=s.amount),s.status==="risky"&&(Ne.risky+=s.amount))}),be.forEach(function(s){var k=Date.parse(s&&s.timestamp||"");!Number.isFinite(k)||k<We||k>Ye||String(s&&s.type)==="income.received"&&(Ne.received+=Number(s&&s.amount)||0)});function Kt(s){var k=Date.parse(s&&s.dueDate||"");return Number.isFinite(k)&&k>=Y&&k<=Qe}function Lt(s,k){var se=Date.parse(s&&s.dueDate||"");return Number.isFinite(se)?se>=Y&&se<=g(Y,k).getTime():!1}var yt=Pe.filter(Kt),wt=yt.filter(function(s){return s.status==="confirmed"}).reduce(function(s,k){return s+k.amount},0),Nt=yt.filter(function(s){return s.status==="expected"}).reduce(function(s,k){return s+k.amount},0),jt=yt.filter(function(s){return s.status==="risky"}).reduce(function(s,k){return s+k.amount},0),Ct=Ae.filter(function(s){return s.status!=="paid"}).reduce(function(s,k){return s+(Number(k.amount)||0)},0),Jt=w(ct-pe);function St(s){Je.push(Object.assign({kind:"setup",targetId:"",actionLabel:"Review",tone:"review"},s))}var Je=[];Ae.filter(function(s){return s.status==="overdue"||s.status==="due_soon"||s.status==="needs_review"||s.status==="deferred"}).slice(0,8).forEach(function(s){var k=String(s.type)==="debt";Je.push({kind:k?"debt":"obligation",id:s.id,targetId:s.id,title:s.title,reason:k?"Debt needs a due date or payment plan":s.status==="overdue"?"Overdue obligation":s.status==="due_soon"?"Due within 7 days":"Needs an obligation decision",actionLabel:k?"Add plan":s.status==="overdue"?"Mark paid":"Review",tone:s.status==="overdue"?"urgent":"review"})}),be.filter(function(s){return String(s&&s.type)==="expense.recorded"&&!String(s&&s.obligationId||"").trim()&&String(s&&s.categoryId||"").toLowerCase()==="obligation"}).slice(0,4).forEach(function(s){St({kind:"payment",id:String(s&&s.id||""),targetId:String(s&&s.id||""),title:String(s&&s.description||"Payment"),reason:"Actual payment needs matching to an obligation",actionLabel:"Match",tone:"review"})}),be.filter(function(s){return String(s&&s.categoryId||"").toLowerCase()==="uncategorized"||String(s&&s.reviewStatus||"").toLowerCase()==="needs_review"}).slice(0,4).forEach(function(s){St({kind:"transaction",id:String(s&&s.id||""),targetId:String(s&&s.id||""),title:String(s&&s.description||"Transaction"),reason:"Uncategorized transaction",actionLabel:"Categorize",tone:"review"})}),Pe.filter(function(s){var k=M(s&&s.dueDate);return s.status==="risky"||k&&k<xe}).slice(0,4).forEach(function(s){Je.push({kind:"pipeline",id:s.id,targetId:s.id,title:s.title,reason:s.status==="risky"?"Risky income assumption":"Expected income is overdue",actionLabel:s.status==="risky"?"Update":"Received",tone:"review"})}),ie.length||Je.unshift({kind:"setup",id:"missing-cash",targetId:"missing-cash",title:"Cash baseline",reason:"Add at least one cash account",actionLabel:"Add account",tone:"urgent"}),X.length||St({kind:"setup",id:"missing-burn",targetId:"missing-burn",title:"Monthly burn",reason:"Add recurring fixed costs",actionLabel:"Add recurring cost",tone:"review"});var me=Je.filter(function(s){return["obligation","payment","transaction","pipeline","debt","setup"].indexOf(String(s&&s.kind||""))!==-1}).slice(0,6),Fe=Pe.filter(function(s){return Lt(s,30)}),je=Ae.filter(function(s){return s.status!=="paid"&&Lt(s,30)}),Xe=Fe.filter(function(s){return s.status==="confirmed"}).reduce(function(s,k){return s+(Number(k.amount)||0)},0),ft=Fe.filter(function(s){return s.status==="expected"}).reduce(function(s,k){return s+(Number(k.amount)||0)*t.clampProbability(k.probability)},0),At=je.reduce(function(s,k){return s+(Number(k.amount)||0)},0),lt=w(ct),Be=w(pe),Ue=w(At),_=w(lt-Be-Ue),ce=w(K.reduce(function(s,k){return s+(Number(k&&k.outstanding)||0)},0)),Ze={actualCash:N("actualCash","Actual cash",lt,[{label:"Active liquid account balances",value:lt,operation:"add"}]),protectedCash:N("protectedCash","Protected cash",Be,ut.filter(function(s){return Number(s&&s.amount)>0}).map(function(s){return{label:String(s.label||"Reserve bucket"),value:Number(s.amount)||0,operation:"add"}})),availableCash:N("availableCash","Available cash",_,[{label:"Actual cash",value:lt,operation:"add"},{label:"This money is protected",value:Be,operation:"subtract"},{label:"Due within 30 days",value:Ue,operation:"subtract"}]),monthlyBurnRate:N("monthlyBurnRate","Monthly burn rate",Me,[{label:"Recurring costs",value:$,operation:"add"},{label:"Debt payment plans",value:ne,operation:"add"}]),runway:N("runway","Runway",Me>0?w(_/Me):0,[{label:"Available cash",value:_,operation:"divide"},{label:"Monthly burn rate",value:Me,operation:"divide"}],Me>0?[]:["Runway is unavailable until monthly burn is known."]),debtBurden:N("debtBurden","Debt burden",ce,K.filter(function(s){return(Number(s&&s.outstanding)||0)>0}).map(function(s){return{label:String(s.name||"Debt"),value:Number(s.outstanding)||0,operation:"add"}}))};return{actualCash:lt,totalCash:lt,protectedCash:Be,reservedCash:Be,trulyAvailableCash:Jt,availableCash:_,committedShortTermObligations:Ue,shortTermObligationWindowDays:30,reserveBuckets:ut,monthlyPersonalBurn:w(f),monthlyBusinessBurn:w(i),totalMonthlyBurn:w(Me),runwayMonths:Me>0?w(_/Me):null,explanations:Ze,obligations:Ae,overdueObligations:Ae.filter(function(s){return s.status==="overdue"}),dueSoonObligations:Ae.filter(function(s){return s.status==="due_soon"}),upcomingObligations:Ae.filter(function(s){return s.status==="upcoming"}),paidObligations:Ae.filter(function(s){return s.status==="paid"}),income:Pe,incomeThisMonth:{confirmed:w(Ne.confirmed),expected:w(Ne.expected),risky:w(Ne.risky),received:w(Ne.received)},incomeScenarios:{conservative:w(_+wt-Ct),expected:w(_+wt+Nt-Ct),optimistic:w(_+wt+Nt+jt-Ct)},dashboardSummary:{actionThisWeek:{count:Je.length,urgentCount:Je.filter(function(s){return s&&s.tone==="urgent"}).length,items:me},next30Days:{confirmedIncoming:w(Xe),expectedWeightedIncoming:w(ft),obligationsDue:w(At),projectedNetMovement:w(Xe+ft-At),incomeCount:Fe.length,obligationCount:je.length}},reviewQueue:Je.slice(0,10),debtRemaining:w(K.reduce(function(s,k){return s+(Number(k&&k.outstanding)||0)},0)),reserveGaps:ut.filter(function(s){return j.indexOf(s.bucket)!==-1&&Number(s.amount)<=0})}}function de(P,x){var B=d(x),Y=t.sortFinancialEvents(l(P)),ie=n.getActiveEvents(Y),X=n.buildReadModel(Y,B),Ce=B.nowIso||new Date().toISOString(),be=Date.parse(Ce),fe=new Date(be);fe.setDate(fe.getDate()+B.forecastDays);var $e=fe.getTime(),K=0,ye=0,q=0,tt=!1,We=0,Ye=t.localDateKey(Ce);ie.forEach(function(_){var ce=Date.parse(_.timestamp),Ze=t.toMinor(Math.abs(Number(_.amount)||0)),s=Number.isFinite(ce)?ce<=be:!1,k=Number.isFinite(ce)?ce>be&&ce<=$e:!1;if(_.type==="income.received"){s?K+=t.toMinor(Number(_.amount)||0):k&&(We+=t.toMinor(Number(_.amount)||0)),s&&Ye&&t.localDateKey(_.timestamp)===Ye&&(ye+=t.toMinor(Number(_.amount)||0));return}if(_.type==="expense.recorded"){tt=!0,s&&(K-=Ze),u(_.timestamp,be,30)&&(q+=Ze);return}_.type!=="debt.added"&&_.type!=="debt.payment_made"&&_.type==="balance.opening_set"&&s&&(K+=t.toMinor(Number(_.amount)||0))});var Qe=l(X.fiatAccounts),_e=l(X.web3Positions),ct=l(X.defiPositions),pe=t.toMinor(Qe.reduce(function(_,ce){return _+(Number(ce&&ce.balance)||0)},0)),ut=t.toMinor(_e.reduce(function(_,ce){return _+(Number(ce&&ce.amount)||0)*(Number(ce&&ce.price)||0)},0)),f=t.toMinor(ct.reduce(function(_,ce){return _+((Number(ce&&ce.collateralValue)||0)-(Number(ce&&ce.debtValue)||0))},0)),i=pe+ut+f,$=Qe.length>0||_e.length>0||ct.length>0,ne=Qe.length>0?pe:$?i:K,Me=0,Ae=0,xe=R(X.transactions);l(X.pipelineDeals).forEach(function(_){if(b(_.status)&&xe[String(_&&_.id||"")]!==!0){var ce=t.clampProbability(_.probability),Ze=t.toMinor(I(_.value,0)*ce);Me+=Ze,S(_.expectedDateISO,be,$e)&&(Ae+=Ze)}});var he=t.toMinor(X.recurringMonthlyTotal||0),mt=t.toMinor(l(X.activeRecurringExpenses).filter(function(_){return _.essential}).reduce(function(_,ce){return _+(Number(ce.monthlyAmount)||0)},0)),pt=mt,Pe=he,Ne=null;(X.recurringExpenses||[]).length>0?Ne=he:q>0?Ne=q:tt&&(Ne=0);var Kt=he>0?Math.round(he*(B.forecastDays/30)):0,Lt=ne+Ae+We-Kt,yt=t.toMinor(X.debtTotal||0),wt=t.toMinor(l(X.reserveBuckets).reduce(function(_,ce){return _+(Number(ce.currentAmount)||0)},0)),Nt=Math.max(0,ne-wt),jt=Ne==null?null:t.fromMinor(Ne),Ct=t.fromMinor(pt),Jt=t.fromMinor(Pe),St=null;Ne!=null&&Ne>0&&(St=w(t.fromMinor(Nt)/t.fromMinor(Ne)));var Je=jt,me=te(X,{},B,be),Fe=[];l(X.transactions).forEach(function(_){(_.reviewStatus==="needs_review"||_.categoryId==="uncategorized")&&Fe.push({type:"Needs review",title:_.description,amount:_.amount,action:"Review",id:_.id,original:_})}),l(X.invoices).forEach(function(_){if(_.status!=="Paid"&&_.expectedDate){var ce=Date.parse(_.expectedDate);Number.isFinite(ce)&&ce<be&&Fe.push({type:"Overdue",title:_.client+" invoice",amount:_.amount,action:"Mark paid",id:_.id,original:_})}}),l(me.upcomingObligations).concat(l(me.overdueObligations)).forEach(function(_){Fe.push({type:"Due soon",title:_.title,amount:_.amount,action:"Review",id:_.id,original:_})}),l(X.debtAccounts).forEach(function(_){_.outstanding>0&&!_.dueDate&&!_.minimumPayment&&Fe.push({type:"Missing plan",title:_.name,amount:_.outstanding,action:"Add plan",id:_.id,original:_})}),l(X.pipelineDeals).filter(function(_){return n.isPipelineActive(_.status)}).length===0&&Fe.push({type:"Missing forecast input",title:"Income pipeline",amount:null,action:"Add income",id:"pipeline-missing"}),l(X.reserveBuckets).length===0&&Fe.push({type:"Missing plan",title:"Reserve buckets",amount:null,action:"Create reserve",id:"reserves-missing"});var je={realBalance:t.fromMinor(ne),projectedBalance:t.fromMinor(Lt),attentionQueue:Fe,trulyAvailable:t.fromMinor(Nt),reserveTotal:t.fromMinor(wt),survivalBurn:Ct,comfortBurn:Jt,weightedPipeline:t.fromMinor(Me),monthlyBurn:jt,runwayMonths:St,breakEvenRevenue:Je,revenueToday:t.fromMinor(ye),totalDebt:t.fromMinor(yt),confidenceScore:1,missingInputs:[],lastComputedAt:Ce,totalCash:me.totalCash,actualCash:me.actualCash,reservedCash:me.reservedCash,protectedCash:me.protectedCash,trulyAvailableCash:me.trulyAvailableCash,availableCash:me.availableCash,committedShortTermObligations:me.committedShortTermObligations,monthlyPersonalBurn:me.monthlyPersonalBurn,monthlyBusinessBurn:me.monthlyBusinessBurn,totalMonthlyBurn:me.totalMonthlyBurn,availableRunwayMonths:me.runwayMonths,confirmedIncomeThisMonth:me.incomeThisMonth.confirmed,expectedIncomeThisMonth:me.incomeThisMonth.expected,riskyIncomeThisMonth:me.incomeThisMonth.risky,debtRemaining:me.debtRemaining};me.totalMonthlyBurn>0&&(je.monthlyBurn=me.totalMonthlyBurn,je.runwayMonths=me.runwayMonths,je.breakEvenRevenue=me.totalMonthlyBurn);var Xe=[];(X.recurringExpenses||[]).length===0&&Xe.push("recurring expenses"),(ie.length===0||!ie.some(function(_){return u(_.timestamp,be,30)}))&&Xe.push("recent financial activity"),je.monthlyBurn==null&&Xe.push("monthly burn"),(X.pipelineDeals||[]).filter(function(_){return b(_.status)}).length===0&&Xe.push("pipeline");var ft=ie.length?Date.parse(ie[ie.length-1].timestamp):0,At=ft>0?be-ft>1080*60*60*1e3:!0,lt={realBalanceFromSums:t.fromMinor(ne),weightedPipelineFromDeals:t.fromMinor(Me),totalDebtFromLiabilities:t.fromMinor(yt)},Be=a.evaluateFinancialInvariants({snapshot:je,components:lt}),Ue=r.computeConfidenceScore({missingRecurringExpenses:(X.recurringExpenses||[]).length===0,noRecentData:Xe.indexOf("recent financial activity")!==-1,undefinedBurn:je.monthlyBurn==null,emptyPipeline:Xe.indexOf("pipeline")!==-1,staleCompute:At,missingInputs:Xe.concat(Be.messages||[]),invariantViolations:Be.violations});return je.confidenceScore=Ue.score,je.missingInputs=Ue.missingInputs,Be.violations.length>0&&e.console&&typeof e.console.warn=="function"&&e.console.warn("[FinanceInvariant] violation(s)",Be.violations),{snapshot:je,readModel:X,treasury:me,explanations:Object.assign({},me.explanations,{forecastConfidence:N("forecastConfidence","Forecast confidence",Math.round((Number(Ue.score)||0)*100),[{label:"Confidence score",value:Math.round((Number(Ue.score)||0)*100),operation:"add"}],Ue.reasons||Ue.missingInputs||[])}),invariants:Be,confidence:Ue,diagnostics:{staleCompute:At,latestEventTimestamp:ft?new Date(ft).toISOString():null,forecastDays:B.forecastDays,baseCurrency:B.baseCurrency,invariantMessages:Be.messages||[],forecastFutureIncome:t.fromMinor(We),realBalanceFromEvents:t.fromMinor(K),realBalanceFromFiatAccounts:t.fromMinor(pe),realBalanceFromAssets:t.fromMinor(i),realBalanceUsesFiatAnchor:Qe.length>0,realBalanceUsesAssetAnchor:$}}}function ve(P,x){return de(P,x).snapshot}var Q={normalizeSettings:d,computeFinancialContext:de,computeFinancialState:ve};typeof module<"u"&&module.exports&&(module.exports=Q),e.FinanceCompute=Q})(typeof window<"u"?window:globalThis);function Hn(e,t="EUR"){const n=String(e||"").trim().toUpperCase();return n||String(t||"").trim().toUpperCase()||"EUR"}function ca(e,t={}){const n=Number(e);if(!Number.isFinite(n))return"—";const a=Hn(t.currency,t.baseCurrency);return new Intl.NumberFormat(t.locale,{style:"currency",currency:a,minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceCompute;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./compute.js")),!t||!n||!a)throw new Error("Finance modal event utilities require events/ledger/compute modules.");function r(g){if(!t.isIsoTimestamp(g))throw new Error("Timestamp is required and must be ISO-8601.");return new Date(g).toISOString()}function d(g){var M=Number(g);if(!Number.isFinite(M))throw new Error("Amount must be a finite number.");return M}function l(g){var M=Number(g);return Number.isFinite(M)&&M>=0&&M<=1}function u(g){if(!l(g))throw new Error("Probability must be in range 0..1.");return Number(g)}function S(g){return n.normalizeSettings(g||{})}function b(g,M){var F=g&&typeof g=="object"?g:{},W=S(M),E=Math.abs(d(F.amount)),C=r(F.timestamp),N=u(F.probability),R=String(F.id||F.related_entity_id||"pipe-"+Date.now()),te=String(F.status||"open").trim().toLowerCase()||"open";return{type:"pipeline.created",amount:E,currency:t.normalizeCurrency(F.currency,W.baseCurrency),timestamp:C,related_entity_id:R,metadata:{title:String(F.title||"Pipeline Item"),value:E,probability:N,status:te,stage:te,expectedDateISO:String(F.expectedDateISO||C.slice(0,10))}}}function I(g,M){var F=g&&typeof g=="object"?g:{},W=S(M),E=Math.abs(d(F.monthlyAmount!=null?F.monthlyAmount:F.amount));return{type:"expense.recurring_set",amount:E,currency:t.normalizeCurrency(F.currency,W.baseCurrency),timestamp:r(F.timestamp),related_entity_id:String(F.id||F.related_entity_id||"expense-"+Date.now()),metadata:{category:String(F.category||"Recurring Expense"),monthlyAmount:E,essential:!!F.essential,active:F.active!==!1}}}function w(g,M){var F=g&&typeof g=="object"?g:{},W=S(M),E=d(F.amount),C=F.type;if(C||(C=E>=0?"income.received":"expense.recorded"),C!=="income.received"&&C!=="expense.recorded")throw new Error("Unsupported transaction draft type: "+C);return{type:C,amount:Math.abs(E),currency:t.normalizeCurrency(F.currency,W.baseCurrency),timestamp:r(F.timestamp),related_entity_id:F.related_entity_id?String(F.related_entity_id):void 0,metadata:F.metadata&&typeof F.metadata=="object"?t.deepClone(F.metadata):{}}}function j(g,M,F){var W=S(F),E=t.isIsoTimestamp(W.nowIso)?W.nowIso:new Date().toISOString(),C=n.appendEvents(g||[],M||[],W,{nowIso:E,allowApproximateTimestamp:!1});return{snapshot:a.computeFinancialState(C.events,{baseCurrency:W.baseCurrency,forecastDays:W.forecastDays,nowIso:E}),events:C.events,appended:C.appended}}function J(g){return Array.isArray(g)?g.slice():[]}var h={requireTimestamp:r,requireAmount:d,validateProbability:l,requireProbability:u,buildPipelineCreateDraft:b,buildRecurringExpenseDraft:I,buildIncomeOrExpenseDraft:w,previewSnapshot:j,cancelWithoutMutation:J};typeof module<"u"&&module.exports&&(module.exports=h),e.FinanceModalEvents=h})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceCompute,r=e.FinanceModalEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./compute.js")),!r&&typeof module<"u"&&module.exports&&(r=require("./modal-events.js")),!t||!n||!a)throw new Error("FinanceCommandService dependencies are missing.");function d(w){return n.normalizeSettings(w||{})}function l(w){return Array.isArray(w)?w:[]}function u(w,j,J){if(!w||typeof w.getFinanceLedger!="function"||typeof w.getFinanceSettings!="function")return null;var h=l(j).filter(Boolean);if(!h.length)return null;var g=w.getFinanceSettings()||{},M=d({baseCurrency:J&&J.baseCurrency||g.baseCurrency,forecastDays:J&&J.forecastDays||g.forecastDays,nowIso:J&&J.nowIso||new Date().toISOString()}),F=w.getFinanceLedger();if(r&&typeof r.previewSnapshot=="function")return r.previewSnapshot(F,h,M).snapshot;var W=n.appendEvents(F,h,M,{nowIso:M.nowIso,allowApproximateTimestamp:!1});return a.computeFinancialState(W.events,M)}function S(w,j,J){if(!w||typeof w.appendFinanceEvents!="function")throw new Error("Store.appendFinanceEvents is unavailable.");var h=l(j).filter(Boolean);if(!h.length)return[];var g=J||{};return w.appendFinanceEvents(h,{source:g.source||"finance.command"})}function b(w){return!w||typeof w.getFinanceLedger!="function"||!n||typeof n.getActiveEvents!="function"?[]:n.getActiveEvents(w.getFinanceLedger())}var I={normalizeSettings:d,previewFromDrafts:u,appendDrafts:S,getActiveEvents:b};e.FinanceCommandService=I})(typeof window<"u"?window:globalThis);window.FinancialEngine=(function(){const e={LOW:"Low",MEDIUM:"Medium",HIGH:"High"};function t(h,g){const M=Number(h);return Number.isFinite(M)?M:Number.isFinite(Number(g))?Number(g):0}function n(h,g,M){const F=t(h,g);return Math.min(M,Math.max(g,F))}function a(h){const g=h&&typeof h=="object"?h:{},M=g.monthlyBurn==null?null:t(g.monthlyBurn,0),F=g.runwayMonths==null?null:t(g.runwayMonths,null);return{realBalance:t(g.realBalance,0),projectedBalance:t(g.projectedBalance,0),weightedPipeline:t(g.weightedPipeline,0),monthlyBurn:M,runwayMonths:F,breakEvenRevenue:g.breakEvenRevenue==null?M:t(g.breakEvenRevenue,M),revenueToday:t(g.revenueToday,0),totalDebt:t(g.totalDebt,0),confidenceScore:Math.max(0,Math.min(1,t(g.confidenceScore,0))),missingInputs:Array.isArray(g.missingInputs)?g.missingInputs.slice():[],lastComputedAt:g.lastComputedAt||new Date().toISOString()}}function r(){return{pipelineDeals:[],recurringExpenses:[],debtAccounts:[],invoices:[],fiatAccounts:[],web3Positions:[],defiPositions:[],expectedPipeline90d:0}}function d(){return!window.Store||typeof window.Store.getFinancialSnapshot!="function"?null:a(window.Store.getFinancialSnapshot())}function l(){if(!window.Store||typeof window.Store.getFinancialReadModel!="function")return r();const h=window.Store.getFinancialReadModel();return h&&typeof h=="object"?h:r()}function u(h){const g=h&&typeof h=="object"?h:{},M=Array.isArray(g.expenses)?g.expenses:[],F=Array.isArray(g.debt)?g.debt:[],W=Array.isArray(g.income)?g.income:[],E=Array.isArray(g.fiatAccounts)?g.fiatAccounts:[],C=Array.isArray(g.savings)?g.savings:[],N=M.reduce((x,B)=>x+t(B&&B.monthlyAmount,0),0),R=F.reduce((x,B)=>x+t(B&&(B.monthlyPayment??B.minimumPaymentMonthly),0),0),te=N+R,de=E.reduce((x,B)=>x+t(B&&B.balance,0),0)+C.reduce((x,B)=>x+t(B&&B.amount,0),0),ve=W.filter(x=>String(x&&x.status||"").toLowerCase()!=="paid").reduce((x,B)=>x+t(B&&B.amount,0)*t(B&&B.probability,0),0),Q=F.reduce((x,B)=>x+t(B&&B.total,0),0),P=te>0?de/te:null;return{realBalance:de,projectedBalance:de+ve,weightedPipeline:ve,monthlyBurn:te,runwayMonths:P,breakEvenRevenue:te,revenueToday:0,totalDebt:Q,confidenceScore:.4,missingInputs:["legacy finance model"],lastComputedAt:new Date().toISOString()}}function S(h){if(h&&typeof h=="object"&&h.financeSnapshot)return{snapshot:a(h.financeSnapshot),readModel:h.financeReadModel&&typeof h.financeReadModel=="object"?h.financeReadModel:r()};if(h&&typeof h=="object"&&h.realBalance!=null&&h.weightedPipeline!=null)return{snapshot:a(h),readModel:r()};const g=d();return g?{snapshot:g,readModel:l()}:{snapshot:a(u(h)),readModel:r()}}function b(h){const g=(Array.isArray(h.fiatAccounts)?h.fiatAccounts:[]).reduce((E,C)=>E+t(C&&C.balance,0),0);let M=0,F=0,W=0;return(Array.isArray(h.web3Positions)?h.web3Positions:[]).forEach(E=>{const C=t(E&&E.amount,0)*t(E&&E.price,0),N=String(E&&E.liquidity||"").toLowerCase();N==="low"?F+=C:N==="med"||N==="medium"?M+=C:W+=C}),{safe:g+W,growth:M,speculative:F}}function I(h){const g=S(h),M=g.snapshot,F=g.readModel||r(),W=b(F),E=M.runwayMonths;let C=e.LOW;E==null||E<4?C=e.HIGH:E<6&&(C=e.MEDIUM);const N=E==null?0:Math.min(100,Math.max(0,E/12*100)),R=Math.round(M.confidenceScore*100),te=M.totalDebt>Math.max(1,M.realBalance)?18:0,de=Math.max(0,Math.min(100,Math.round(N*.6+R*.4-te))),ve=M.monthlyBurn==null?0:M.monthlyBurn,Q=t(F.expectedPipeline90d,M.weightedPipeline),P=Date.parse(String(h&&h.nowIso||""))||Date.now(),x=P+2160*60*60*1e3,B=(Array.isArray(F.invoices)?F.invoices:[]).filter(fe=>String(fe&&fe.status||"").toLowerCase()==="paid").filter(fe=>{const $e=Date.parse(String(fe&&fe.paidAt||fe&&fe.sentAt||fe&&fe.expectedDateISO||fe&&fe.timestamp||""));return Number.isFinite($e)&&$e>=P&&$e<=x}).reduce((fe,$e)=>fe+t($e&&$e.amount,0),0),Y=M.realBalance,ie=M.projectedBalance,X=M.totalDebt,Ce=W.growth+W.speculative;return{fiatTotal:W.safe,savingsTotal:0,debtTotalRemaining:X,web3Total:Ce,totalNetWorth:ie,liquidNetWorth:Y,monthlyBurn:ve,survivalBurn:ve,runwayMonths:M.runwayMonths,survivalRunwayMonths:M.runwayMonths,confirmedIncome90d:B,weightedIncome90d:Q,stressLevel:C,safetyScore:de,allocation:W,confidenceScore:M.confidenceScore,missingInputs:M.missingInputs,computedAt:M.lastComputedAt}}function w(h,g={}){const M=S(h),F=I(h),W=M.readModel||r(),E=12,C={safe:[],realistic:[],optimistic:[]},N=Array.isArray(W.pipelineDeals)?W.pipelineDeals:[];let R=t(M.snapshot.realBalance,0),te=t(M.snapshot.realBalance,0),de=t(M.snapshot.realBalance,0);const ve=n(t(g.probFloor,50)/100,0,1),Q=n(t(g.marketShift,0),-1,1);for(let P=0;P<E;P++){const x=new Date;x.setMonth(x.getMonth()+P);const B=new Date(x.getFullYear(),x.getMonth(),1),Y=new Date(x.getFullYear(),x.getMonth()+1,0),ie=N.filter(K=>{const ye=new Date(K.expectedDateISO||"");return ye>=B&&ye<=Y}),X=K=>n(Math.max(t(K,0),ve)*(1+Q),0,1),Ce=ie.filter(K=>String(K.status||"").toLowerCase()==="signed"||String(K.status||"").toLowerCase()==="paid").reduce((K,ye)=>K+t(ye.value,0),0),be=ie.reduce((K,ye)=>K+t(ye.value,0)*X(ye.probability),0),fe=ie.reduce((K,ye)=>K+t(ye.value,0)*n(X(ye.probability)+.2,0,1),0),$e=t(F.monthlyBurn,0)*(1+(g.burnChange||0));R=R+Ce-$e,te=te+be-$e,de=de+fe-$e,C.safe.push(Math.max(0,R)),C.realistic.push(Math.max(0,te)),C.optimistic.push(Math.max(0,de))}return C}function j(h){if(!h)return null;const g=h.runwayMonths;return{RUNWAY_STATUS:g==null?"unknown":g>=6?"safe":g>=4?"thin":"critical",STRESS_LEVEL:String(h.stressLevel||e.HIGH).toLowerCase(),STABILITY_SCORE:t(h.safetyScore,0),URGENCY_FLAG:g==null||g<4,CONFIDENCE_SCORE:t(h.confidenceScore,0),MISSING_INPUTS:Array.isArray(h.missingInputs)?h.missingInputs.slice():[]}}function J(){if(!window.Store||typeof window.Store.getFinancialSnapshot!="function")return null;const h=I({financeSnapshot:window.Store.getFinancialSnapshot(),financeReadModel:typeof window.Store.getFinancialReadModel=="function"?window.Store.getFinancialReadModel():r()});return j(h)}return{compute:I,generateProjections:w,getSignals:j,getSignalsFromStore:J,STRESS_LEVELS:e}})();function la(e,t=12){const n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}function En(e){const t=new Date;return t.setUTCDate(t.getUTCDate()+e),`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,"0")}-${String(t.getUTCDate()).padStart(2,"0")}`}function da(e){const t=n=>la(n);return[{type:"asset.account_set",amount:10400,currency:e,timestamp:t(-28),related_entity_id:"cash-operating",metadata:{name:"Operating cash",balance:10400,active:!0,scope:"business",bucket:"available"}},{type:"asset.account_set",amount:6200,currency:e,timestamp:t(-27),related_entity_id:"reserve-tax",metadata:{name:"Tax reserve",balance:6200,active:!0,scope:"business",bucket:"tax_reserve",reserved:!0}},{type:"asset.account_set",amount:2800,currency:e,timestamp:t(-26),related_entity_id:"reserve-vat",metadata:{name:"VAT reserve",balance:2800,active:!0,scope:"business",bucket:"vat_reserve",reserved:!0}},{type:"asset.account_set",amount:1800,currency:e,timestamp:t(-25),related_entity_id:"reserve-health",metadata:{name:"Health insurance reserve",balance:1800,active:!0,scope:"personal",bucket:"health_insurance",reserved:!0}},{type:"asset.account_set",amount:3e3,currency:e,timestamp:t(-24),related_entity_id:"reserve-buffer",metadata:{name:"Studio buffer",balance:3e3,active:!0,scope:"shared",bucket:"buffer",reserved:!0}},...[["Housing",1450,!0],["Studio & tools",420,!0],["Living",1120,!0],["Subscriptions",260,!1],["Flexible buffer",450,!1]].map(([n,a,r],d)=>({type:"expense.recurring_set",amount:Number(a),currency:e,timestamp:t(-16+d),related_entity_id:`expense-${d+1}`,metadata:{category:n,monthlyAmount:a,essential:r,active:!0,dueDay:1+d*4,frequency:"monthly",scope:d<2?"business":"personal"}})),{type:"debt.added",amount:6400,currency:e,timestamp:t(-90),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},{type:"debt.payment_made",amount:1e3,currency:e,timestamp:t(-15),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},...[["Editorial system",2600,-72],["Advisory sprint",1750,-39],["Research direction",3200,-13]].flatMap(([n,a,r],d)=>{const l=`settled-${d+1}`,u=t(Number(r));return[{type:"invoice.paid",amount:Number(a),currency:e,timestamp:u,related_entity_id:l,metadata:{client:n,amount:a,expectedDate:En(Number(r)),destinationAccountId:"cash-operating",scope:"business"}},{type:"income.received",amount:Number(a),currency:e,timestamp:u,related_entity_id:l,metadata:{description:`Invoice paid: ${n}`,invoiceId:l,accountId:"cash-operating",accountName:"Operating Cash",categoryId:"client-income",scope:"business",source:"demo"}}]}),...[["Product strategy retainer",4200,.9,18,"confirmed"],["Design systems advisory",2900,.65,37,"expected"],["Research collaboration",5600,.35,64,"risky"]].map(([n,a,r,d,l],u)=>({type:"pipeline.created",amount:Number(a),currency:e,timestamp:t(-6+u),related_entity_id:`pipeline-${u+1}`,metadata:{title:n,value:a,probability:r,status:l,stage:l,expectedDateISO:En(Number(d)),destinationAccountId:"cash-operating",destinationAccountName:"Operating Cash",scope:"business"}})),{type:"expense.recorded",amount:180,currency:e,timestamp:t(-5),related_entity_id:"transaction-research-tools",metadata:{description:"Research tools",accountId:"cash-operating",accountName:"Operating Cash",categoryId:"tools",scope:"business",source:"demo"}}]}const H=Object.freeze({ledger:"finance-master.ledger.v1",settings:"finance-master.settings.v1",ui:"finance-master.ui.v1",review:"finance-master.review.v1",goals:"finance-master.goals.v1",imports:"finance-master.imports.v1",priceCache:"finance-master.prices.v1",backupMeta:"finance-master.backup-meta.v1",focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",collapsedPrefix:"finance-master.layout.collapsed.",heroDetails:"finance-master.layout.hero-details",demoSeed:"finance-master.demo-seeded.v1"}),kn=Object.freeze(Object.values(H)),yn="Finance Master",wn=2,ua=[1,2],_t="finance-master.local-first.v1";function ma(e){try{return JSON.parse(e)}catch{return e}}function pa(e,t){return e!==void 0?{source:"indexeddb",value:e,removeLegacy:!1}:t==null?{source:"empty",value:void 0,removeLegacy:!1}:{source:"localStorage",value:ma(t),removeLegacy:!0}}const fa="finance-master",ga=1,xt="state",tn=new Map;let Pt=null;function un(e){return JSON.parse(JSON.stringify(e))}function va(e){return typeof e=="string"?e:JSON.stringify(e)}function ba(e){try{return window.localStorage.getItem(e)}catch{return null}}function Wn(e,t){try{window.localStorage.setItem(e,va(t))}catch{}}function ha(e){try{window.localStorage.removeItem(e)}catch{}}function $n(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}function ya(){return"indexedDB"in window?new Promise(e=>{const t=indexedDB.open(fa,ga);t.onupgradeneeded=()=>{t.result.objectStoreNames.contains(xt)||t.result.createObjectStore(xt)},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}):Promise.resolve(null)}async function wa(e){if(!Pt)return;const t=Pt.transaction(xt,"readonly");return $n(t.objectStore(xt).get(e))}async function Yn(e,t){if(Wn(e,t),!Pt)return;const n=Pt.transaction(xt,"readwrite");await $n(n.objectStore(xt).put(un(t),e))}async function Sa(e){if(ha(e),!Pt)return;const t=Pt.transaction(xt,"readwrite");await $n(t.objectStore(xt).delete(e))}async function Aa(e){Pt=await ya(),await Promise.all(e.map(async t=>{const n=await wa(t),a=ba(t),r=pa(n,a);if(r.source!=="empty"){if(tn.set(t,un(r.value)),r.source==="indexeddb"){Wn(t,r.value);return}await Yn(t,r.value)}}))}function Dn(e,t){return un(tn.has(e)?tn.get(e):t)}function Gt(e,t){tn.set(e,un(t)),Yn(e,t)}function on(e){tn.delete(e),Sa(e)}function Ut(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Ia(e){return typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function qt(e,t,n,a="error"){return{key:e,label:t,message:n,severity:a}}function Qn(e={}){const t=e.indexedDbAvailable===!0,n=e.localStorageAvailable===!0,a=e.quotaAvailable===!0,r=Number.isFinite(Number(e.quotaUsage))?Number(e.quotaUsage):null,d=Number.isFinite(Number(e.quotaLimit))?Number(e.quotaLimit):null,l=t!==!0||n!==!0||a!==!0;return{storageStatus:!t&&!n?"unavailable":l?"limited":"healthy",indexedDbAvailable:t,localStorageAvailable:n,quotaAvailable:a,quotaUsage:r,quotaLimit:d,privateModeWarning:l}}async function $a(e=globalThis){var t=!1;try{var n=e&&e.localStorage;if(n){var a="finance-master.storage-check";n.setItem(a,"ok"),n.removeItem(a),t=!0}}catch{t=!1}var r=!1,d=null,l=null;try{var u=await e?.navigator?.storage?.estimate?.();u&&Number.isFinite(Number(u.quota))&&(r=!0,d=Number.isFinite(Number(u.usage))?Number(u.usage):0,l=Number(u.quota))}catch{r=!1}return Qn({indexedDbAvailable:!!(e&&"indexedDB"in e),localStorageAvailable:t,quotaAvailable:r,quotaUsage:d,quotaLimit:l})}function Mn(e){if(!Array.isArray(e))return null;const t=e.reduce((n,a)=>{const r=Date.parse(String(a?.timestamp||a?.created_at||""));return Number.isFinite(r)?Math.max(n,r):n},0);return t>0?new Date(t).toISOString():null}function Kn(e,t,n){const a=Array.isArray(e?.ledger)?e.ledger:[];return{appName:n,schemaLabel:t,backupVersion:e?.version,exportedAt:e?.exportedAt,eventCount:a.length,latestLocalEventAt:Mn(a)}}function Da(e){const t=[],n=e.ledger;n.present&&!Array.isArray(n.value)&&t.push(qt("ledger","Ledger events","Stored ledger data is not a list of finance events.")),Array.isArray(n.value)&&n.value.forEach((d,l)=>{(!Ut(d)||!String(d.id||"").trim()||!String(d.type||"").trim()||!Number.isFinite(Number(d.amount))||!Ia(d.timestamp))&&t.push(qt("ledger","Ledger events",`Ledger event ${l+1} is incomplete.`))}),[["settings","Finance settings"],["ui","UI settings"],["review","Review state"],["goals","Goals"],["imports","CSV import history"],["priceCache","Cached prices"]].forEach(([d,l])=>{e[d]?.present&&!Ut(e[d].value)&&t.push(qt(d,l,`${l} is stored in an unreadable shape.`))}),e.imports?.present&&Ut(e.imports.value)&&!Array.isArray(e.imports.value.batches)&&t.push(qt("imports","CSV import history","CSV import history is missing its batch list.")),e.goals?.present&&Ut(e.goals.value)&&!Array.isArray(e.goals.value.goals)&&t.push(qt("goals","Goals","Goals data is missing its goal list.")),e.priceCache?.present&&Ut(e.priceCache.value)&&!Ut(e.priceCache.value.quotes)&&t.push(qt("priceCache","Cached prices","Cached price data is missing its quote map."));const a=Mn(Array.isArray(n.value)?n.value:[]),r=Array.isArray(n.value)?n.value.length:0;return{ok:t.every(d=>d.severity!=="error"),issues:t,eventCount:r,latestEventAt:a,checkedAt:new Date().toISOString()}}function Ma(e){return JSON.parse(JSON.stringify(e))}function Tn(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}const xa=Object.freeze([{schemaLabel:_t,migrate(e){return Ma(e)}}]);function On(e){const t=[];return Tn(e)?(Object.prototype.hasOwnProperty.call(e,"ledger")&&e.ledger!==void 0&&!Array.isArray(e.ledger)&&t.push("Ledger events must be stored as a list."),["settings","ui","review","goals","imports","priceCache"].forEach(n=>{Object.prototype.hasOwnProperty.call(e,n)&&e[n]!==void 0&&!Tn(e[n])&&t.push(`${n} must be stored as an object.`)}),{valid:t.length===0,errors:t}):{valid:!1,errors:["Repository snapshot must be an object."]}}function Na(e,t=_t){const n=On(e);if(!n.valid)return{status:"failed",safeToMigrate:!1,errors:n.errors};const a=xa.find(l=>l.schemaLabel===t);if(!a)return{status:"pending",safeToMigrate:!1,errors:[]};const r=a.migrate(e),d=On(r);return{status:d.valid?"current":"failed",safeToMigrate:d.valid,errors:d.errors}}class Ca{id="manual";async getQuotes(t,n){return[]}}const Rn={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",USDC:"usd-coin"},Fa=8e3;class Ea{id="coingecko";async getQuotes(t,n){const a=n.toLowerCase(),r=[...new Set(t.map(b=>Rn[b.toUpperCase()]).filter(Boolean))];if(!r.length)return[];const d=new AbortController,l=globalThis.setTimeout(()=>d.abort(),Fa);let u;try{const b=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(r.join(","))}&vs_currencies=${encodeURIComponent(a)}`,{signal:d.signal});if(!b.ok)throw new Error("CoinGecko price refresh is temporarily unavailable.");u=await b.json()}catch(b){throw b instanceof DOMException&&b.name==="AbortError"?new Error("CoinGecko price refresh timed out."):b instanceof Error?b:new Error("CoinGecko price refresh failed.")}finally{globalThis.clearTimeout(l)}const S=new Date().toISOString();return t.flatMap(b=>{const I=Rn[b.toUpperCase()],w=Number(u[I]?.[a]);return Number.isFinite(w)?[{symbol:b.toUpperCase(),currency:n.toUpperCase(),price:w,source:this.id,quotedAt:S}]:[]})}}function ka(e){return e==="coingecko"?new Ea:new Ca}function Ee(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function bt(e,t=!1){return t&&e===null?!0:typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function Jn(e,t=!1){return["personal","business","shared"].includes(e)||t&&e==="all"}function Ta(e,t){if(!Array.isArray(e)){t.push("Ledger events are missing.");return}e.forEach((n,a)=>{(!Ee(n)||!String(n.id||"").trim()||!String(n.type||"").trim()||!Number.isFinite(Number(n.amount))||!String(n.currency||"").trim()||!bt(n.timestamp)||!bt(n.created_at)||!Ee(n.metadata))&&t.push(`Ledger event ${a+1} is incomplete.`)})}function Oa(e,t){(!Ee(e.financeSettings)||!String(e.financeSettings.baseCurrency||"").trim()||!Number.isFinite(Number(e.financeSettings.forecastDays)))&&t.push("Finance settings are incomplete.");const n=e.uiSettings;(!Ee(n)||!["aurora","midnight","bright"].includes(n.appearance)||typeof n.reducedMotion!="boolean"||!Jn(n.scopeFilter,!0)||!["manual","coingecko"].includes(n.walletPriceSource)||!Ee(n.scenario)||!["marketMajors","burnDelta","probFloor"].every(a=>Number.isFinite(Number(n.scenario[a]))))&&t.push("UI settings are incomplete.")}function Ra(e,t,n){if(!Ee(e)||!bt(e.lastReviewedAt,!0)){t.push("Weekly review state is incomplete.");return}n===2&&(!Ee(e.accountReconciliations)||!Ee(e.checklist)||typeof e.checklist.recurringCosts!="boolean"||typeof e.checklist.pipeline!="boolean"||typeof e.checklist.signals!="boolean"||typeof e.notes!="string"||Object.values(e.accountReconciliations).some(a=>!Ee(a)||!String(a.accountId||"").trim()||!Number.isFinite(Number(a.balance))||!bt(a.reviewedAt)))&&t.push("Weekly review ritual state is incomplete.")}function _a(e,t,n){n!==1&&(!Ee(e)||!Array.isArray(e.goals)||e.goals.some(a=>!Ee(a)||!String(a.id||"").trim()||!String(a.name||"").trim()||!["savings","buffer"].includes(a.type)||!Number.isFinite(Number(a.targetAmount))||Number(a.targetAmount)<=0||!Jn(a.scope)||!Array.isArray(a.linkedAccountIds)||a.targetDate!==void 0&&!/^\d{4}-\d{2}-\d{2}$/.test(String(a.targetDate))||!bt(a.createdAt)||!bt(a.updatedAt)))&&t.push("Savings and buffer goals are incomplete.")}function Pa(e,t,n){Ra(e.review,t,n),_a(e.goals,t,n),(!Ee(e.imports)||!Array.isArray(e.imports.batches)||e.imports.batches.some(a=>!Ee(a)||!String(a.id||"").trim()||!bt(a.importedAt)||!String(a.sourceFile||"").trim()||!Array.isArray(a.fingerprints)))&&t.push("CSV import history is incomplete."),(!Ee(e.prices)||!Ee(e.prices.quotes))&&t.push("Cached wallet prices are incomplete.")}function mn(e,t){return new Set((Array.isArray(e)?e:[]).filter(n=>n&&n.type===t).map(n=>String(n.related_entity_id||n.id||"")).filter(Boolean)).size}function xn(e,t={}){const n=[],a=[];if(!Ee(e))return{valid:!1,counts:{},errors:["Backup must be a JSON object."],warnings:a};ua.includes(e.version)||n.push("Backup version is not supported."),bt(e.exportedAt)||n.push("Backup export date is missing or invalid."),Ta(e.ledger,n),Oa(e,n),Pa(e,n,e.version);const r=Array.isArray(e.ledger)?e.ledger:[],d=Date.parse(String(t.latestLocalEventAt||"")),l=Date.parse(String(e.exportedAt||""));Number.isFinite(d)&&Number.isFinite(l)&&l<d&&a.push("This backup is older than your newest local finance event.");const u=Ee(e.metadata)?e.metadata:Kn(e,_t,yn);return{valid:n.length===0,version:e.version,currentVersion:wn,schemaLabel:String(u.schemaLabel||_t),appName:String(u.appName||yn),exportedAt:bt(e.exportedAt)?e.exportedAt:void 0,latestLocalEventAt:Mn(r)||void 0,counts:{ledgerEvents:r.length,accounts:mn(r,"asset.account_set"),recurringCosts:mn(r,"expense.recurring_set"),pipelineItems:mn(r,"pipeline.created"),goals:Array.isArray(e.goals?.goals)?e.goals.goals.length:0,importBatches:Array.isArray(e.imports?.batches)?e.imports.batches.length:0,cachedQuotes:Ee(e.prices?.quotes)?Object.keys(e.prices.quotes).length:0},errors:n,warnings:a}}function Ba(e){const t=xn(e);if(!t.valid||e.version!==1)throw new Error(t.errors.concat(e.version===1?[]:["Backup is not version 1."]).join(" "));return e}function La(e){const t=Ba(e);return{...t,version:2,review:{lastReviewedAt:t.review.lastReviewedAt,accountReconciliations:{},checklist:{recurringCosts:!1,pipeline:!1,signals:!1},notes:""},goals:{goals:[]}}}function ja(e){const t=xn(e);if(!t.valid)throw new Error(t.errors.join(" "));return e.version===1?La(e):e}const Ua=["personal","business","shared"];function Wt(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function qa(e,t="shared"){return Ua.includes(e)?e:t}function za(e,t){return t==="all"||e===t||e==="shared"}function Va(e){const t=Wt(e)?e:{},n=Wt(t.accountReconciliations)?t.accountReconciliations:{},a={};Object.entries(n).forEach(([l,u])=>{if(!Wt(u)||!String(u.accountId||l).trim())return;const S=Number(u.balance),b=String(u.reviewedAt||"");!Number.isFinite(S)||!Number.isFinite(Date.parse(b))||(a[l]={accountId:String(u.accountId||l),balance:S,reviewedAt:b})});const r=Wt(t.checklist)?t.checklist:{};return{lastReviewedAt:(t.lastReviewedAt===null||Number.isFinite(Date.parse(String(t.lastReviewedAt||""))))&&t.lastReviewedAt||null,accountReconciliations:a,checklist:{recurringCosts:r.recurringCosts===!0,pipeline:r.pipeline===!0,signals:r.signals===!0},notes:typeof t.notes=="string"?t.notes:""}}function Xn(e){return{goals:(Wt(e)&&Array.isArray(e.goals)?e.goals:[]).flatMap(n=>{if(!Wt(n)||!String(n.id||"").trim()||!String(n.name||"").trim())return[];const a=Number(n.targetAmount);if(!Number.isFinite(a)||a<=0)return[];const r=Number.isFinite(Date.parse(String(n.createdAt||"")))?String(n.createdAt):new Date().toISOString(),d=Number.isFinite(Date.parse(String(n.updatedAt||"")))?String(n.updatedAt):r;return[{id:String(n.id),name:String(n.name),type:n.type==="savings"?"savings":"buffer",targetAmount:a,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(n.targetDate||""))?String(n.targetDate):void 0,scope:qa(n.scope),linkedAccountIds:Array.isArray(n.linkedAccountIds)?n.linkedAccountIds.map(String).filter(Boolean):[],createdAt:r,updatedAt:d}]})}}function Ga(e,t,n="all"){const a=new Map((Array.isArray(t)?t:[]).map(r=>[String(r.id),r]));return Xn(e).goals.filter(r=>za(r.scope,n)).map(r=>{const d=r.linkedAccountIds.reduce((l,u)=>{const S=a.get(u);return l+Math.max(0,Number(S&&S.balance)||0)},0);return{...r,currentAmount:d,progressPercent:Math.min(100,Math.max(0,d/r.targetAmount*100))}})}const Xt={baseCurrency:"EUR",forecastDays:90},pn={appearance:"bright",reducedMotion:!1,scopeFilter:"all",walletPriceSource:"manual",scenario:{marketMajors:0,burnDelta:0,probFloor:50}},_n={lastReviewedAt:null,accountReconciliations:{},checklist:{unresolvedItems:!1,matchPayments:!1,confirmObligations:!1,reviewSignals:!1,closeMonth:!1},notes:""},Pn={goals:[]},Bn={batches:[]},Ln={quotes:{}},Ha={lastBackupAt:null};let jn=Qn({indexedDbAvailable:!1,localStorageAvailable:!1,quotaAvailable:!1}),Un="current";const Wa=Object.freeze({__financeMasterMissing:!0});function Te(e){return JSON.parse(JSON.stringify(e))}function sn(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Dt(e,t){return Dn(e,t)}function Oe(e,t){Gt(e,t)}function zt(e,t,n,a){const r=Number(e);return Number.isFinite(r)?Math.min(n,Math.max(t,r)):a}function qn(e,t="bright"){return e==="midnight"||e==="bright"||e==="aurora"?e:t}function ue(e,t="shared"){return e==="personal"||e==="business"||e==="shared"?e:t}function zn(e,t="all"){return e==="all"?e:ue(e,t==="all"?"shared":t)}function Ot(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function fn(e){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function Ya(e,t){if(t==="all")return!0;const n=ue(e.metadata?.scope);return n===t||n==="shared"}function it(e,t){window.dispatchEvent(new CustomEvent("finance:updated",{detail:{snapshot:Te(e),context:{source:t}}}))}const cn=new Map;function Ht(){cn.clear()}function Vt(){const e=Dt(H.ledger,[]);return Array.isArray(e)?e:[]}function gn(e){Oe(H.ledger,e),Ht()}function qe(e){const t=Dn(e,Wa),n=!(sn(t)&&t.__financeMasterMissing===!0);return{present:n,value:n?t:void 0}}function ge(e,t){const n=Date.parse(String(t||""));let a=Number.isFinite(n)?n:Date.now();const r=G.getFinanceLedger().filter(d=>String(d.related_entity_id||"")===e).reduce((d,l)=>Math.max(d,Date.parse(l.timestamp)||0),0);return r>=a&&(a=r+1),new Date(a).toISOString()}function Qa(e){return{type:"asset.account_set",amount:0,currency:e.currency,timestamp:e.timestamp,related_entity_id:Ot("cash"),metadata:{name:"Operating cash",balance:0,active:!0,scope:e.scope,bucket:"available",reserved:!1,source:"first-transaction-default-account"}}}function Ka(e){const t=String(e??"");return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function Ja(e){return window.FinanceDates?.toDateOnly?.(e)||String(e||"").slice(0,10)}function Zt(e,t,n,a){const r=G.getFinanceSettings().baseCurrency,d=ge(e),l=G.getActiveFinanceEvents().filter(u=>t.includes(u.type)).filter(u=>a?a(u):String(u.related_entity_id||"")===e).map(u=>({type:"finance.event_reversed",amount:0,currency:u.currency||r,timestamp:d,related_entity_id:u.id,metadata:{entity_id:e,reason:n,reversed_event_id:u.id}}));return l.length?G.appendFinanceEvents(l,{source:n}):[]}const G={async initialize(){await Aa([H.ledger,H.settings,H.ui,H.review,H.goals,H.imports,H.priceCache,H.backupMeta,H.demoSeed]),jn=await $a(window),Un=Na({ledger:qe(H.ledger).value,settings:qe(H.settings).value,ui:qe(H.ui).value,review:qe(H.review).value,goals:qe(H.goals).value,imports:qe(H.imports).value,priceCache:qe(H.priceCache).value},_t).status},getFinanceSettings(){const e=Dt(H.settings,Xt);return sn(e)?{baseCurrency:String(e.baseCurrency||Xt.baseCurrency).trim().toUpperCase()||"EUR",forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||Xt.forecastDays))}:Te(Xt)},saveFinanceSettings(e){const t=this.getFinanceSettings(),n={baseCurrency:String(e.baseCurrency||t.baseCurrency).trim().toUpperCase()||t.baseCurrency,forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||t.forecastDays))};return Oe(H.settings,n),Ht(),it(this.getFinancialSnapshot(!0),"saveFinanceSettings"),n},getUiSettings(){const e=Dt(H.ui,pn);if(!sn(e))return Te(pn);const t=sn(e.scenario)?e.scenario:{};return{appearance:qn(e.appearance),reducedMotion:e.reducedMotion===!0,scopeFilter:zn(e.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":"manual",scenario:{marketMajors:zt(t.marketMajors,-50,50,0),burnDelta:zt(t.burnDelta,-30,30,0),probFloor:zt(t.probFloor,0,100,50)}}},saveUiSettings(e){const t=this.getUiSettings(),n=e.scenario||t.scenario,a={appearance:qn(e.appearance,t.appearance),reducedMotion:typeof e.reducedMotion=="boolean"?e.reducedMotion:t.reducedMotion,scopeFilter:zn(e.scopeFilter,t.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":e.walletPriceSource==="manual"?"manual":t.walletPriceSource,scenario:{marketMajors:zt(n.marketMajors,-50,50,t.scenario.marketMajors),burnDelta:zt(n.burnDelta,-30,30,t.scenario.burnDelta),probFloor:zt(n.probFloor,0,100,t.scenario.probFloor)}};return Oe(H.ui,a),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(a)})),a},getFinanceLedger(){const e=Vt();return window.FinanceEvents?.sortFinancialEvents?Te(window.FinanceEvents.sortFinancialEvents(e)):Te(e)},getActiveFinanceEvents(){const e=Vt();return window.FinanceLedger?.getActiveEvents?Te(window.FinanceLedger.getActiveEvents(e)):Te(e)},computeFinanceContext(e=!1,t="all"){if(!e&&cn.has(t))return Te(cn.get(t));if(!window.FinanceCompute?.computeFinancialContext)throw new Error("Finance compute module is unavailable.");const n=this.getFinanceSettings(),a=Vt().filter(d=>Ya(d,t)),r=window.FinanceCompute.computeFinancialContext(a,{...n,nowIso:new Date().toISOString()});return cn.set(t,r),Te(r)},getFinancialSnapshot(e=!1,t="all"){return this.computeFinanceContext(e,t).snapshot},getFinancialReadModel(e=!1,t="all"){return this.computeFinanceContext(e,t).readModel},appendFinanceEvent(e,t={}){return this.appendFinanceEvents([e],t)[0]||null},appendFinanceEvents(e,t={}){if(!e.length)return[];if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),a=this.getFinanceSettings(),r=window.FinanceLedger.appendEvents(Vt(),e,{...a,nowIso:n},{nowIso:n,allowApproximateTimestamp:!1});return gn(r.events),it(this.getFinancialSnapshot(!0),String(t.source||"appendFinanceEvents")),Te(r.appended)},reverseFinanceEvent(e,t="undo"){if(!window.FinanceLedger?.reverseEvent)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),a=this.getFinanceSettings(),r=window.FinanceLedger.reverseEvent(Vt(),e,t,{...a,nowIso:n},{nowIso:n});return gn(r.events),it(this.getFinancialSnapshot(!0),"reverseFinanceEvent"),Te(r.appended[0]||null)},reverseTransaction(e,t="ledger.transaction.reverse"){const n=(this.getFinancialReadModel().transactions||[]).find(S=>String(S.id)===String(e||"")||String(S.transactionEntityId||"")===String(e||""));if(!n)throw new Error("This transaction could not be found.");const a=String(n.id),r=String(n.transactionEntityId||""),d=this.getFinanceSettings().baseCurrency,l=ge(r||a),u=this.getActiveFinanceEvents().filter(S=>String(S.id)===a||!!r&&String(S.metadata?.transactionId||"")===r).map(S=>({type:"finance.event_reversed",amount:0,currency:S.currency||d,timestamp:l,related_entity_id:S.id,metadata:{entity_id:r||a,reason:t,reversed_event_id:S.id}}));return u.length?this.appendFinanceEvents(u,{source:"reverseTransaction"}):[]},recordTransaction(e){const t=(this.getFinancialReadModel().fiatAccounts||[]).find(b=>String(b.id)===String(e.accountId||"")),n=Number(e.amount);if(!t)throw new Error("Choose a cash account before saving this transaction.");if(!Number.isFinite(n)||n===0)throw new Error("Transaction amount must be non-zero.");const a=this.getFinanceSettings().baseCurrency,r=ge(`transaction-${e.accountId}`,e.timestamp),d=Ot("transaction"),l=ue(e.scope,ue(t.scope)),u=Math.round(((Number(t.balance)||0)+n)*100)/100,S={accountId:String(t.id),accountName:String(t.name||"Account"),categoryId:String(e.categoryId||"uncategorized"),scope:l,source:String(e.source||"manual"),importBatchId:e.importBatchId||void 0,fingerprint:e.fingerprint||void 0,sourceFile:e.sourceFile||void 0,obligationId:e.obligationId||void 0,obligationDueDate:e.obligationDueDate||void 0,obligationTitle:e.obligationTitle||void 0};return this.appendFinanceEvents([{type:n>0?"income.received":"expense.recorded",amount:Math.abs(n),currency:a,timestamp:r,related_entity_id:d,metadata:{...S,description:e.description}},{type:"asset.account_set",amount:u,currency:a,timestamp:ge(String(t.id),r),related_entity_id:String(t.id),metadata:{name:t.name,balance:u,active:!0,scope:l,bucket:t.bucket,reserved:t.reserved,transactionId:d,source:S.source,importBatchId:S.importBatchId}}],{source:e.source||"recordTransaction"})},recordLedgerTransaction(e){const t=String(e.type||"").toLowerCase(),n=Math.abs(Number(e.amount));if(!["income","expense","adjustment"].includes(t))throw new Error("Choose income, expense, or adjustment.");if(!Number.isFinite(n)||n<=0)throw new Error("Transaction amount must be positive.");const r=this.getFinancialReadModel().fiatAccounts||[],d=String(e.accountId||""),l=ue(e.scope,"business");if(!d&&r.length===0){const g=this.getFinanceSettings().baseCurrency,M=ge("first-transaction-account",e.timestamp),F=Qa({currency:g,timestamp:M,scope:l}),W=String(F.related_entity_id||""),E=t==="income"?n:t==="expense"||e.direction==="decrease"?-n:n,C=e.categoryId||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),N=Ot(t==="adjustment"?"adjustment":"transaction"),R={type:t==="income"?"income.received":t==="expense"?"expense.recorded":"cash.adjusted",amount:n,currency:g,timestamp:ge(N,M),related_entity_id:N,metadata:{ledgerType:t==="adjustment"?"adjustment":void 0,direction:t==="adjustment"?e.direction==="decrease"?"decrease":"increase":void 0,description:e.description,accountId:W,accountName:"Operating cash",categoryId:C,scope:l,source:"manual-ledger"}},te={type:"asset.account_set",amount:E,currency:g,timestamp:ge(W,M),related_entity_id:W,metadata:{name:"Operating cash",balance:E,active:!0,scope:l,bucket:"available",reserved:!1,transactionId:N,source:"manual-ledger"}};return this.appendFinanceEvents([F,R,te],{source:"recordLedgerTransaction.firstAccount"})}if(t==="income")return this.recordTransaction({description:e.description,amount:n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"client-income",scope:e.scope,source:"manual-ledger"});if(t==="expense")return this.recordTransaction({description:e.description,amount:-n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"uncategorized",scope:e.scope,source:"manual-ledger"});const u=(this.getFinancialReadModel().fiatAccounts||[]).find(g=>String(g.id)===String(e.accountId||""));if(!u)throw new Error("Choose a cash account before saving this adjustment.");const S=e.direction==="decrease"?"decrease":"increase",b=S==="decrease"?-n:n,I=this.getFinanceSettings().baseCurrency,w=ge(`adjustment-${e.accountId}`,e.timestamp),j=Ot("adjustment"),J=ue(e.scope,ue(u.scope)),h=Math.round(((Number(u.balance)||0)+b)*100)/100;return this.appendFinanceEvents([{type:"cash.adjusted",amount:n,currency:I,timestamp:w,related_entity_id:j,metadata:{ledgerType:"adjustment",direction:S,description:e.description,accountId:String(u.id),accountName:String(u.name||"Account"),categoryId:String(e.categoryId||"adjustment"),scope:J,source:"manual-ledger"}},{type:"asset.account_set",amount:h,currency:I,timestamp:ge(String(u.id),w),related_entity_id:String(u.id),metadata:{name:u.name,balance:h,active:!0,scope:ue(u.scope),bucket:u.bucket,reserved:u.reserved,transactionId:j,source:"manual-ledger"}}],{source:"recordLedgerTransaction.adjustment"})},recordTransfer(e){const t=this.getFinancialReadModel(),n=(t.fiatAccounts||[]).find(w=>String(w.id)===String(e.fromAccountId||"")),a=(t.fiatAccounts||[]).find(w=>String(w.id)===String(e.toAccountId||"")),r=Math.abs(Number(e.amount));if(!n||!a)throw new Error("Choose both transfer accounts.");if(String(n.id)===String(a.id))throw new Error("Transfer accounts must be different.");if(!Number.isFinite(r)||r<=0)throw new Error("Transfer amount must be positive.");const d=this.getFinanceSettings().baseCurrency,l=ge(`transfer-${n.id}-${a.id}`,e.timestamp),u=Ot("transfer"),S=ue(e.scope,ue(n.scope)),b=Math.round(((Number(n.balance)||0)-r)*100)/100,I=Math.round(((Number(a.balance)||0)+r)*100)/100;return this.appendFinanceEvents([{type:"transfer.recorded",amount:r,currency:d,timestamp:l,related_entity_id:u,metadata:{ledgerType:"transfer",direction:"transfer",description:e.description||`Transfer from ${String(n.name||"account")} to ${String(a.name||"account")}`,fromAccountId:String(n.id),fromAccountName:String(n.name||"From account"),toAccountId:String(a.id),toAccountName:String(a.name||"To account"),accountId:String(n.id),accountName:String(n.name||"From account"),categoryId:String(e.categoryId||"transfer"),scope:S,source:"manual-ledger"}},{type:"asset.account_set",amount:b,currency:d,timestamp:ge(String(n.id),l),related_entity_id:String(n.id),metadata:{name:n.name,balance:b,active:!0,scope:ue(n.scope),bucket:n.bucket,reserved:n.reserved,transactionId:u,source:"manual-ledger"}},{type:"asset.account_set",amount:I,currency:d,timestamp:ge(String(a.id),l),related_entity_id:String(a.id),metadata:{name:a.name,balance:I,active:!0,scope:ue(a.scope),bucket:a.bucket,reserved:a.reserved,transactionId:u,source:"manual-ledger"}}],{source:"recordTransfer"})},reviewObligation(e){const n=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(j=>String(j.id||"")===String(e.id||""));if(!n)throw new Error("This obligation could not be found.");const a=e.status;if(a!=="paid"&&a!=="deferred"&&a!=="needs_review")throw new Error("Choose a valid obligation status.");const r=this.getFinanceSettings().baseCurrency,d=Math.abs(Number(e.amount??n.amount));if(!Number.isFinite(d)||d<=0)throw new Error("Obligation amount must be positive.");let l="",u="",S="";const b=ue(n.scope);if(a==="paid"){if(!e.accountId)throw new Error("Choose the account that paid this obligation.");const j=(this.getFinancialReadModel().fiatAccounts||[]).find(h=>String(h.id)===String(e.accountId));if(!j)throw new Error("Choose a valid payment account.");u=String(j.id),S=String(j.name||"Account");const J=this.recordTransaction({description:`Paid ${String(n.title||"obligation")}`,amount:-d,timestamp:fn(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)),accountId:u,categoryId:"obligation",scope:b,source:"obligation.review",obligationId:String(n.id),obligationDueDate:String(n.dueDate||""),obligationTitle:String(n.title||"Obligation")});l=String(J[0]?.related_entity_id||J[0]?.id||"")}if(a==="deferred"&&!e.deferredUntil)throw new Error("Choose a new due date for this deferred obligation.");const I=ge(String(e.id)),w=this.appendFinanceEvent({type:"obligation.reviewed",amount:d,currency:r,timestamp:I,related_entity_id:String(e.id),metadata:{status:a,title:String(n.title||"Obligation"),dueDate:String(n.dueDate||""),originalDueDate:String(n.originalDueDate||n.dueDate||""),paidAt:a==="paid"?fn(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)):void 0,deferredUntil:a==="deferred"?e.deferredUntil:void 0,accountId:u,accountName:S,transactionId:l,scope:b,notes:e.notes||""}},{source:"reviewObligation"});return w?[w]:[]},reviewTransaction(e){const n=(this.getFinancialReadModel().transactions||[]).find(u=>String(u.id)===String(e.id||"")||String(u.transactionEntityId||"")===String(e.id||""));if(!n)throw new Error("This transaction could not be found.");const a=String(e.categoryId||"").trim();if(!a)throw new Error("Choose a category for this transaction.");const r=this.getFinanceSettings().baseCurrency,d=String(n.id||e.id),l=this.appendFinanceEvent({type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:r,timestamp:ge(d),related_entity_id:d,metadata:{categoryId:a,scope:ue(e.scope,ue(n.scope)),reviewStatus:"reviewed",notes:String(e.notes||"")}},{source:"reviewTransaction"});return l?[l]:[]},matchTransactionToObligation(e){const n=(this.getFinancialReadModel().transactions||[]).find(b=>String(b.id)===String(e.transactionId||"")||String(b.transactionEntityId||"")===String(e.transactionId||""));if(!n)throw new Error("This payment could not be found.");if(String(n.type)!=="expense.recorded")throw new Error("Only expense payments can be matched to obligations.");const r=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(b=>String(b.id||"")===String(e.obligationId||""));if(!r)throw new Error("Choose an obligation to match this payment to.");const d=this.getFinanceSettings().baseCurrency,l=String(n.id||e.transactionId),u=ue(r.scope,ue(n.scope)),S=ge(String(r.id));return this.appendFinanceEvents([{type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:d,timestamp:S,related_entity_id:l,metadata:{categoryId:"obligation",scope:ue(n.scope),reviewStatus:"reviewed",obligationId:String(r.id),obligationTitle:String(r.title||"Obligation"),notes:String(e.notes||"")}},{type:"obligation.reviewed",amount:Math.abs(Number(n.amount)||Number(r.amount)||0),currency:d,timestamp:ge(String(r.id),S),related_entity_id:String(r.id),metadata:{status:"paid",title:String(r.title||"Obligation"),dueDate:String(r.dueDate||""),originalDueDate:String(r.originalDueDate||r.dueDate||""),paidAt:String(n.timestamp||new Date().toISOString()),accountId:String(n.accountId||""),accountName:String(n.accountName||""),transactionId:l,scope:u,notes:String(e.notes||"")}}],{source:"matchTransactionToObligation"})},updatePipelineReview(e){const t=this.getFinancialReadModel(),n=(t.pipelineDeals||[]).find(b=>String(b.id)===String(e.id||""));if(!n)throw new Error("This pipeline item could not be found.");const a=String(e.status||"").toLowerCase();if(!["confirmed","expected","risky"].includes(a))throw new Error("Choose confirmed, expected, or risky.");const r=Number(e.probability);if(!Number.isFinite(r)||r<0||r>1)throw new Error("Probability must be between 0 and 1.");const d=window.FinanceDates?.toDateOnly?.(e.expectedDateISO)||"";if(!d)throw new Error("Choose a valid expected date.");const l=(t.fiatAccounts||[]).find(b=>String(b.id)===String(e.destinationAccountId||"")),u=this.getFinanceSettings().baseCurrency,S=ge(String(n.id));return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:u,timestamp:S,related_entity_id:String(n.id),metadata:{stage:a,status:a,title:n.title,scope:ue(n.scope),expectedDateISO:d,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:l?String(l.name||""):"",notes:String(e.notes||"")}},{type:"pipeline.probability_changed",amount:r,currency:u,timestamp:ge(String(n.id),S),related_entity_id:String(n.id),metadata:{probability:r,scope:ue(n.scope),expectedDateISO:d,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:l?String(l.name||""):"",notes:String(e.notes||"")}}],{source:"updatePipelineReview"})},cancelPipelineItem(e,t=""){const n=(this.getFinancialReadModel().pipelineDeals||[]).find(r=>String(r.id)===String(e||""));if(!n)throw new Error("This pipeline item could not be found.");const a=this.getFinanceSettings().baseCurrency;return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:a,timestamp:ge(String(n.id)),related_entity_id:String(n.id),metadata:{stage:"cancelled",status:"cancelled",title:n.title,scope:ue(n.scope),notes:t}}],{source:"cancelPipelineItem"})},saveDebtPlan(e){const t=(this.getFinancialReadModel().debtAccounts||[]).find(u=>String(u.id)===String(e.id||""));if(!t)throw new Error("This debt item could not be found.");let n=window.FinanceDates?.toDateOnly?.(e.dueDate)||"",a=Math.abs(Number(e.minimumPayment));const r=e.planType||"regular";if(r==="custom"){const u=Array.isArray(e.installments)?e.installments:[];if(!u.length)throw new Error("Add at least one installment for a custom plan.");const S=[...u].sort((b,I)=>b.date.localeCompare(I.date));n=window.FinanceDates?.toDateOnly?.(S[0].date)||n,a=Math.abs(Number(S[0].amount))||0}else{if(!n)throw new Error("Choose a debt due date.");if(!Number.isFinite(a)||a<=0)throw new Error("Add a positive minimum payment.")}const d=this.getFinanceSettings().baseCurrency,l=this.appendFinanceEvent({type:"debt.plan_updated",amount:a,currency:d,timestamp:ge(String(t.id)),related_entity_id:String(t.id),metadata:{name:t.name,scope:ue(t.scope),dueDate:n,minimumPayment:a,paymentPlanNote:String(e.paymentPlanNote||"").trim(),planType:r,frequency:String(e.frequency||"monthly"),installments:e.installments||[]}},{source:"saveDebtPlan"});return l?[l]:[]},deactivateFiatAccount(e){return Zt(e,["asset.account_set"],"deactivateFiatAccount",t=>{const n=t.metadata||{};return String(t.related_entity_id||"")===e||String(n.accountId||"")===e})},deactivateRecurringExpense(e){return Zt(e,["expense.recurring_set"],"deactivateRecurringExpense")},deactivateWeb3Position(e){return Zt(e,["asset.position_set"],"deactivateWeb3Position")},deactivateDefiPosition(e){return Zt(e,["asset.defi_set"],"deactivateDefiPosition")},deactivateDebtAccount(e){return Zt(e,["debt.added","debt.payment_made"],"deactivateDebtAccount")},markPipelineItemPaid(e,t={}){const n=this.getFinancialReadModel(),a=(n.pipelineDeals||[]).find(I=>String(I.id)===e);if(!a||String(a.status).toLowerCase()==="paid")return[];const r=this.getFinanceSettings().baseCurrency,d=ge(e,t.timestamp),l=Math.abs(Number(a.value)||0),u=String(t.destinationAccountId||a.destinationAccountId||""),S=(n.fiatAccounts||[]).find(I=>String(I.id)===u);if(!S)throw new Error("Choose a settlement account before marking this pipeline item as paid.");const b=[{type:"pipeline.stage_changed",amount:0,currency:r,timestamp:d,related_entity_id:e,metadata:{stage:"paid",status:"paid",title:a.title,scope:ue(a.scope)}},{type:"invoice.paid",amount:l,currency:r,timestamp:d,related_entity_id:e,metadata:{client:a.title,amount:l,expectedDate:a.expectedDateISO,destinationAccountId:u,scope:ue(a.scope)}},{type:"income.received",amount:l,currency:r,timestamp:d,related_entity_id:e,metadata:{description:`Invoice paid: ${String(a.title||"Invoice")}`,invoiceId:e,destinationAccountId:u,accountId:u,accountName:S.name,categoryId:"client-income",scope:ue(a.scope),source:"pipeline-settlement"}}];if(S){const I=Math.round(((Number(S.balance)||0)+l)*100)/100;b.push({type:"asset.account_set",amount:I,currency:r,timestamp:ge(String(S.id),d),related_entity_id:String(S.id),metadata:{name:S.name,balance:I,active:!0,scope:ue(S.scope),bucket:S.bucket,reserved:S.reserved,invoiceId:e,settlementTransfer:!0}})}return this.appendFinanceEvents(b,{source:"markPipelineItemPaid"})},getReviewState(){return Va(Dt(H.review,_n))},completeWeeklyReview(e={}){const n=this.getFinancialReadModel().fiatAccounts||[],a=Array.isArray(e.accounts)?e.accounts:n.map(b=>({accountId:String(b.id),balance:Number(b.balance)||0}));if(a.some(b=>!String(b.accountId||"").trim()||!Number.isFinite(Number(b.balance))))throw new Error("Each reconciled account needs a valid balance.");const r=new Date().toISOString(),d=this.getFinanceSettings().baseCurrency,l=a.flatMap(b=>{const I=n.find(j=>String(j.id)===String(b.accountId)),w=Number(b.balance);return!I||!Number.isFinite(w)||w===Number(I.balance)?[]:[{type:"asset.account_set",amount:w,currency:d,timestamp:ge(String(I.id),r),related_entity_id:String(I.id),metadata:{name:I.name,balance:w,active:!0,scope:ue(I.scope),bucket:I.bucket,reserved:I.reserved,source:"weekly-review-reconciliation"}}]});l.length&&this.appendFinanceEvents(l,{source:"completeWeeklyReview.reconcile"});const u=Object.fromEntries(a.map(b=>[String(b.accountId),{accountId:String(b.accountId),balance:Number(b.balance),reviewedAt:r}])),S={lastReviewedAt:r,accountReconciliations:u,checklist:{unresolvedItems:e.unresolvedItems!==!1,matchPayments:e.matchPayments!==!1,confirmObligations:e.confirmObligations!==!1,reviewSignals:e.reviewSignals!==!1,closeMonth:e.closeMonth!==!1},notes:String(e.notes||"")};return Oe(H.review,S),it(this.getFinancialSnapshot(!0),"completeWeeklyReview"),S},getGoals(){return Xn(Dt(H.goals,Pn))},getGoalProgress(e="all"){return Ga(this.getGoals(),this.getFinancialReadModel(!1,"all").fiatAccounts||[],e)},saveGoal(e){const t=this.getGoals(),n=t.goals.find(l=>l.id===e.id),a=new Date().toISOString(),r=Number(e.targetAmount);if(!String(e.name||"").trim())throw new Error("Add a name for this goal.");if(!Number.isFinite(r)||r<=0)throw new Error("Goal target must be greater than zero.");const d={id:n?.id||Ot("goal"),name:String(e.name).trim(),type:e.type==="savings"?"savings":"buffer",targetAmount:r,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(e.targetDate||""))?e.targetDate:void 0,scope:ue(e.scope,n?.scope||"shared"),linkedAccountIds:Array.isArray(e.linkedAccountIds)?e.linkedAccountIds.map(String).filter(Boolean):[],createdAt:n?.createdAt||a,updatedAt:a};return t.goals=n?t.goals.map(l=>l.id===d.id?d:l):[...t.goals,d],Oe(H.goals,t),it(this.getFinancialSnapshot(!0),"saveGoal"),Te(d)},deleteGoal(e){const t=this.getGoals();return t.goals=t.goals.filter(n=>n.id!==String(e)),Oe(H.goals,t),it(this.getFinancialSnapshot(!0),"deleteGoal"),Te(t)},getImportState(){return Dt(H.imports,Bn)},importCsvTransactions(e,t){const n=String(t.sourceFile||"pasted-transactions.csv"),a=new Set(this.getActiveFinanceEvents().map(b=>String(b.metadata?.fingerprint||"")).filter(Boolean)),r=Ot("import");let d=0,l=0;const u=[];e.forEach(b=>{if(a.has(b.fingerprint)){l+=1;return}a.add(b.fingerprint),u.push(b.fingerprint),this.recordTransaction({description:b.description,amount:b.amount,timestamp:fn(b.date),accountId:t.accountId,categoryId:b.categoryId,scope:b.scope,source:"csv-import",importBatchId:r,fingerprint:b.fingerprint,sourceFile:n}),d+=1});const S=this.getImportState();return S.batches.push({id:r,importedAt:new Date().toISOString(),sourceFile:n,fingerprints:u}),Oe(H.imports,S),{batchId:r,imported:d,duplicates:l}},exportTransactionsCsv(){const e=["date","description","amount","direction","type","account","accountId","category","scope","reviewStatus","linkedObligationId","linkedIncomeId","source"],t=(this.getFinancialReadModel().transactions||[]).map(n=>{const a=Number(n.signedAmount??n.amount)||0;return[Ja(n.timestamp),n.description,a,n.direction||(a<0?"out":"in"),n.ledgerType||n.type,n.accountName||n.fromAccountName||"",n.accountId||n.fromAccountId||"",n.categoryId,n.scope,n.reviewStatus,n.obligationId,n.linkedIncomeId,n.source].map(Ka).join(",")});return[e.join(","),...t].join(`
`)},undoImportBatch(e){const t=this.getFinanceSettings().baseCurrency,n=this.getActiveFinanceEvents().filter(a=>String(a.metadata?.importBatchId||"")===String(e)).map(a=>({type:"finance.event_reversed",amount:0,currency:a.currency||t,timestamp:ge(String(a.related_entity_id||a.id)),related_entity_id:a.id,metadata:{reason:"undoImportBatch",reversed_event_id:a.id,importBatchId:e}}));return n.length?this.appendFinanceEvents(n,{source:"undoImportBatch"}):[]},getPriceCache(){return Dt(H.priceCache,Ln)},async refreshCryptoPrices(){const e=this.getUiSettings(),t=ka(e.walletPriceSource),n=(this.getFinancialReadModel().web3Positions||[]).filter(b=>b.manualPriceOverride!==!0);if(!n.length||t.id==="manual")return{updated:0,source:t.id};const a=n.map(b=>String(b.symbolOrName||"")).filter(Boolean);let r;try{r=await t.getQuotes(a,this.getFinanceSettings().baseCurrency)}catch(b){return{updated:0,source:t.id,error:b instanceof Error?b.message:"Price refresh failed."}}const d=new Map(r.map(b=>[b.symbol.toUpperCase(),b])),l=this.getFinanceSettings().baseCurrency,u=n.flatMap(b=>{const I=d.get(String(b.symbolOrName||"").toUpperCase());return I?[{type:"asset.position_set",amount:0,currency:l,timestamp:new Date().toISOString(),related_entity_id:String(b.id),metadata:{symbolOrName:b.symbolOrName,chain:b.chain,amount:b.amount,price:I.price,liquidity:b.liquidity,scope:ue(b.scope),priceSource:I.source,priceUpdatedAt:I.quotedAt,manualPriceOverride:!1}}]:[]}),S=this.getPriceCache();return r.forEach(b=>{S.quotes[b.symbol.toUpperCase()]=b}),Oe(H.priceCache,S),u.length&&this.appendFinanceEvents(u,{source:"refreshCryptoPrices"}),{updated:u.length,source:t.id}},exportBackup(){const e=new Date().toISOString(),t={version:wn,exportedAt:e,ledger:this.getFinanceLedger(),financeSettings:this.getFinanceSettings(),uiSettings:this.getUiSettings(),review:this.getReviewState(),goals:this.getGoals(),imports:this.getImportState(),prices:this.getPriceCache()};return{...t,metadata:Kn(t,_t,yn)}},recordBackupExport(e=new Date().toISOString()){Oe(H.backupMeta,{lastBackupAt:e})},previewBackup(e){return xn(e,{latestLocalEventAt:this.getLocalDataHealth().latestEventAt})},restoreBackup(e){const t=ja(e);return Oe(H.ledger,t.ledger),Oe(H.settings,t.financeSettings||Xt),Oe(H.ui,t.uiSettings||pn),Oe(H.review,t.review||_n),Oe(H.goals,t.goals||Pn),Oe(H.imports,t.imports||Bn),Oe(H.priceCache,t.prices||Ln),Gt(H.demoSeed,"restored-backup"),Ht(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(this.getUiSettings())})),it(this.getFinancialSnapshot(!0),"restoreBackup"),this.exportBackup()},getLocalDataHealth(){const e=Dt(H.backupMeta,Ha);return{...Da({ledger:qe(H.ledger),settings:qe(H.settings),ui:qe(H.ui),review:qe(H.review),goals:qe(H.goals),imports:qe(H.imports),priceCache:qe(H.priceCache)}),...jn,schemaLabel:_t,backupVersion:wn,lastBackupAt:typeof e.lastBackupAt=="string"?e.lastBackupAt:null,migrationStatus:Un,storageKeys:[...kn]}},resetLocalFinanceData(){return kn.forEach(e=>on(e)),Gt(H.demoSeed,"deleted"),Ht(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(this.getUiSettings())})),it(this.getFinancialSnapshot(!0),"resetLocalFinanceData"),this.getLocalDataHealth()},deleteInvoice(e,t={}){const n=this.getFinanceSettings().baseCurrency,a=ge(e,t.timestamp),r=[];return t.reverseSettlement===!0&&this.getActiveFinanceEvents().filter(d=>{const l=d.metadata||{};return String(d.related_entity_id||"")===e||String(l.invoiceId||"")===e}).filter(d=>["invoice.paid","income.received","asset.account_set"].includes(d.type)).forEach(d=>r.push({type:"finance.event_reversed",amount:0,currency:d.currency||n,timestamp:a,related_entity_id:d.id,metadata:{reason:"deleteInvoice",reversed_event_id:d.id,entity_id:e}})),r.push({type:"pipeline.stage_changed",amount:0,currency:n,timestamp:a,related_entity_id:e,metadata:{stage:"cancelled",status:"cancelled"}}),this.appendFinanceEvents(r,{source:"deleteInvoice"})},seedDemoIfNeeded(e=!1){const t=Vt();if(!e&&t.length>0){Dn(H.demoSeed,"")||Gt(H.demoSeed,"existing-ledger");return}const n=this.getFinanceSettings().baseCurrency,a=new Date().toISOString(),r=da(n);if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const d=window.FinanceLedger.appendEvents([],r,{...this.getFinanceSettings(),nowIso:a},{nowIso:a,allowApproximateTimestamp:!1});gn(d.events),Gt(H.demoSeed,"1"),it(this.getFinancialSnapshot(!0),"seedDemoIfNeeded")},clearAndReseedDemo(){on(H.ledger),on(H.demoSeed),Ht(),this.seedDemoIfNeeded(!0),it(this.getFinancialSnapshot(!0),"clearAndReseedDemo")},deleteSampleData(){on(H.ledger),Gt(H.demoSeed,"deleted"),Ht(),it(this.getFinancialSnapshot(!0),"deleteSampleData")}};function Nn(e){const t=e.getUiSettings();document.documentElement.dataset.appearance=t.appearance,document.documentElement.classList.toggle("settings-reduced-motion",t.reducedMotion),document.body.classList.toggle("settings-reduced-motion",t.reducedMotion)}const Xa=[",",";","	"];function Za(e){return String(e||"").toLowerCase().replace(/[^a-z0-9]/g,"")}function Ft(e,t){return e.find(n=>t.includes(Za(n)))||""}function Sn(e,t){const n=[];let a="",r=!1;for(let d=0;d<e.length;d+=1){const l=e[d];l==='"'&&e[d+1]==='"'?(a+='"',d+=1):l==='"'?r=!r:l===t&&!r?(n.push(a.trim()),a=""):a+=l}return n.push(a.trim()),n}function ei(e){const t=Xa.map(n=>({delimiter:n,fields:Sn(e,n).length})).sort((n,a)=>a.fields-n.fields);return t[0].fields>1?t[0].delimiter:","}function An(e){const t=String(e||"").split(/\r?\n/).filter(r=>r.trim());if(t.length<2)throw new Error("Provide a header row and at least one transaction.");const n=ei(t[0]),a=Sn(t[0],n).map(r=>r.trim());if(a.some(r=>!r))throw new Error("Every CSV column needs a header.");if(new Set(a).size!==a.length)throw new Error("CSV headers must be unique.");return{delimiter:n,headers:a,rows:t.slice(1).map((r,d)=>({rowNumber:d+2,values:Sn(r,n)}))}}function Zn(e){return{date:Ft(e,["date","bookingdate","transactiondate","valuedate"]),description:Ft(e,["description","memo","note","details","payee","reference","narrative"]),amount:Ft(e,["amount","value","total","transactionamount"]),debit:Ft(e,["debit","withdrawal","outflow","moneyout"]),credit:Ft(e,["credit","deposit","inflow","moneyin"]),category:Ft(e,["category","categoryid"]),scope:Ft(e,["scope","group"])}}function ti(e){const t=String(e||"").trim(),n=t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/),a=n?`${n[3]}-${n[2].padStart(2,"0")}-${n[1].padStart(2,"0")}`:t,r=Date.parse(`${a}T12:00:00`);return Number.isFinite(r)?new Date(r).toISOString().slice(0,10):""}function vn(e){const t=String(e||"").trim();if(!t)return 0;const n=t.startsWith("(")&&t.endsWith(")");let a=t.replace(/[()\s']/g,"").replace(/[^\d,.-]/g,"");const r=a.lastIndexOf(","),d=a.lastIndexOf(".");if(r>=0&&d>=0){const u=r>d?",":".";a=a.replace(u===","?/\./g:/,/g,"").replace(u,".")}else if(r>=0){const u=a.length-r-1;a=u>0&&u<=2?a.replace(",","."):a.replace(/,/g,"")}const l=Number(a);return Number.isFinite(l)?n?-Math.abs(l):l:Number.NaN}function Et(e,t,n){if(!n)return"";const a=e.headers.indexOf(n);return a>=0?String(t.values[a]||"").trim():""}function ni(e){return`${e.date}|${e.description.trim().toLowerCase()}|${Number(e.amount).toFixed(2)}`}function ai(e,t,n={}){const a=[],r=[],d=[],l=new Set(n.existingFingerprints||[]),u=new Set,S=String(n.defaultCategory||"uncategorized").trim()||"uncategorized",b=["personal","shared"].includes(n.defaultScope)?n.defaultScope:"business",I=new Set(e.headers),w=[t.date,t.description].filter(Boolean);if(w.length!==2||w.some(h=>!I.has(h)))throw new Error("Map both the date and description columns.");const j=!!(t.amount&&I.has(t.amount)),J=!!(t.debit&&I.has(t.debit)||t.credit&&I.has(t.credit));if(!j&&!J)throw new Error("Map a signed amount column or at least one debit or credit column.");return e.rows.forEach(h=>{const g=ti(Et(e,h,t.date)),M=Et(e,h,t.description),F=j?vn(Et(e,h,t.amount)):Math.abs(vn(Et(e,h,t.credit)))-Math.abs(vn(Et(e,h,t.debit)));if(!g){a.push({rowNumber:h.rowNumber,reason:"Date is missing or invalid."});return}if(!M){a.push({rowNumber:h.rowNumber,reason:"Description is missing."});return}if(!Number.isFinite(F)||F===0){a.push({rowNumber:h.rowNumber,reason:"Amount must be non-zero."});return}const W=Et(e,h,t.scope).toLowerCase(),E=["personal","business","shared"].includes(W)?W:b,C={date:g,description:M,amount:Math.round(F*100)/100,categoryId:Et(e,h,t.category)||S,scope:E};if(C.fingerprint=ni(C),l.has(C.fingerprint)||u.has(C.fingerprint)){r.push(C);return}u.add(C.fingerprint),d.push(C)}),{rows:d,rejected:a,duplicates:r,sourceFile:String(n.sourceFile||"pasted-transactions.csv")}}function ii(e){return e==="	"?"Tab":e===";"?"Semicolon":"Comma"}function D(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function dt(e="shared"){return[["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function oi(e="all"){return`<option value="all"${e==="all"?" selected":""}>All scopes</option>${dt(e)}`}function ht(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Unknown date"}function ri(e){const t=String(e||"").replace(/_/g," ").replace(/\./g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Transaction"}function si(e){const t=Number(e.signedAmount);if(Number.isFinite(t))return t;const n=Math.abs(Number(e.amount)||0);return String(e.type)==="expense.recorded"?-n:n}function Re(e,t=!1){return`
    <div class="modal-actions">
      <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
      <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'${e}'">${t?"Save":"Create"}</button>
    </div>
  `}function ea(e,t){return t?`<button class="btn-danger ui-btn" type="button" data-action="${e}">Deactivate</button>`:""}function ci(){return`
    <div class="modal-form">
      <h2 id="modal-title">New Entry</h2>
      <p class="modal-copy">Add items to your treasury OS.</p>
      <div class="quick-add-grid">
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'"><strong>Add transaction</strong><span>Record income, expense, or transfer</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'income'"><strong>Add invoice / expected income</strong><span>Confirmed, likely, uncertain, or overdue</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'expense'"><strong>Add recurring cost</strong><span>Fixed obligation that affects runway</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'debtAdd'"><strong>Add debt</strong><span>Track a loan or credit obligation</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'reserveBucket'"><strong>Add reserve bucket</strong><span>Tax, VAT, buffer, or available cash</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'csvImport'"><strong>Import local CSV</strong><span>Bring in transactions for review</span></button>
      </div>
    </div>
  `}function li(e="expense",t){const n=["expense","income","transfer","adjustment"].includes(e)?e:"expense";return`
    <div class="modal-form">
      <h2 id="modal-title">${n==="income"?"Add income":n==="transfer"?"Add transfer":n==="adjustment"?"Add cash adjustment":"Add expense"}</h2>
      <p class="modal-copy">Enter a positive amount. Corrections are handled by reversing the entry and adding a new one.</p>
      <div class="modal-grid-dynamic" data-active-type="${n}">
        <div class="form-group fg-type">
          <label for="modal-fast-txn-type">Type</label>
          <select id="modal-fast-txn-type" onchange="this.closest('.modal-grid-dynamic').dataset.activeType = this.value; document.getElementById('modal-title').textContent = 'Add ' + (this.value === 'expense' ? 'expense' : this.value === 'income' ? 'income' : this.value === 'transfer' ? 'transfer' : 'cash adjustment');">
            <option value="expense"${n==="expense"?" selected":""}>Expense</option>
            <option value="income"${n==="income"?" selected":""}>Income</option>
            <option value="transfer"${n==="transfer"?" selected":""}>Transfer</option>
            <option value="adjustment"${n==="adjustment"?" selected":""}>Adjustment</option>
          </select>
        </div>
        <div class="form-group fg-amount">
          <label for="modal-fast-txn-amount">Amount</label>
          <input id="modal-fast-txn-amount" type="number" min="0" step="0.01" placeholder="Positive amount" />
        </div>
        <div class="form-group fg-date">
          <label for="modal-fast-txn-date">Date</label>
          <input id="modal-fast-txn-date" type="date" value="${t.today()}" />
        </div>
        <div class="form-group fg-account">
          <label for="modal-fast-txn-account">Account</label>
          <select id="modal-fast-txn-account">${t.accountOptions("",!1)}</select>
        </div>
        <div class="form-group fg-to-account conditional-transfer">
          <label for="modal-fast-txn-to-account">Transfer destination</label>
          <select id="modal-fast-txn-to-account">${t.accountOptions("",!1)}</select>
        </div>
        <div class="form-group fg-direction conditional-adjustment">
          <label for="modal-fast-txn-direction">Adjustment direction</label>
          <select id="modal-fast-txn-direction">
            <option value="increase">Increase account</option>
            <option value="decrease">Decrease account</option>
          </select>
        </div>
        <div class="form-group fg-category conditional-income-expense">
          <label for="modal-fast-txn-category">Category</label>
          <input id="modal-fast-txn-category" placeholder="uncategorized" />
        </div>
        <div class="form-group fg-scope conditional-income-expense">
          <label for="modal-fast-txn-scope">Scope</label>
          <select id="modal-fast-txn-scope">${dt("business")}</select>
        </div>
        <div class="form-group fg-note">
          <label for="modal-fast-txn-desc">Note <span class="fin-text-med">(optional)</span></label>
          <input id="modal-fast-txn-desc" placeholder="Client payment or studio rent" data-autofocus />
        </div>
      </div>
      ${Re("transaction")}
    </div>
  `}const Ke=document.querySelector("#modal-overlay"),Mt=document.querySelector("#modal-body");let Bt="",gt="",nn="",Cn="pasted-transactions.csv",He=null,rt={date:"",description:""},Ve=null,ln="uncategorized",dn="business",Rt=null,Yt=null,In=null,Qt=null;const ee={search:"",accountId:"",scope:"all",categoryId:"",type:"all",reviewStatus:"all",dateFrom:"",dateTo:""};function A(e){return document.querySelector(`#${e}`)?.value.trim()||""}function ta(e){return document.querySelector(`#${e}`)?.checked===!0}function st(){return window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10)}function Vn(e=st()){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function en(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function De(e){const t=G.getFinanceSettings();return new Intl.NumberFormat(void 0,{style:"currency",currency:t.baseCurrency,maximumFractionDigits:2}).format(Number(e)||0)}function di(){const e=Qt;return e?`
    <div class="modal-form">
      <h2 id="modal-title">${D(e.title)}</h2>
      <p class="modal-copy">${D(e.copy)}</p>
      <p class="modal-copy"><strong>Recommended first:</strong> export a backup from Import & Backup if you may need this data later.</p>
      <div class="form-group">
        <label for="modal-destructive-phrase">Type ${D(e.phrase)} to continue</label>
        <input id="modal-destructive-phrase" data-autofocus autocomplete="off" spellcheck="false" />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button id="modal-destructive-confirm" class="btn-danger ui-btn" type="button" data-action="applyDestructiveConfirmation" disabled>${D(e.buttonLabel)}</button>
      </div>
    </div>
  `:'<div class="modal-form"><h2 id="modal-title">Confirmation unavailable</h2><p class="modal-copy">Close this dialog and try the action again.</p></div>'}function ui(){const e=document.querySelector("#modal-destructive-phrase"),t=document.querySelector("#modal-destructive-confirm");!e||!t||!Qt||(t.disabled=e.value!==Qt.phrase)}function kt(e="",t="Not mapped"){const n=He?.headers||[];return`<option value="">${t}</option>${n.map(a=>`<option value="${D(a)}"${a===e?" selected":""}>${D(a)}</option>`).join("")}`}function ae(e){if(!Mt)return;let t=Mt.querySelector(".modal-error");t||(t=document.createElement("div"),t.className="modal-error",t.setAttribute("role","alert"),t.tabIndex=-1,Mt.querySelector("h2")?.insertAdjacentElement("afterend",t)),t.textContent=e,t.focus()}function mi(){const e=G.getFinancialSnapshot(),t=G.getFinancialReadModel(),n=window.FinanceDates?.toDateOnly?.(ee.dateFrom)||"",a=window.FinanceDates?.toDateOnly?.(ee.dateTo)||"",r=ee.search.toLowerCase(),d=(t.transactions||[]).filter(l=>!ee.accountId||String(l.accountId)===ee.accountId||String(l.fromAccountId)===ee.accountId||String(l.toAccountId)===ee.accountId).filter(l=>ee.scope==="all"||String(l.scope)===ee.scope).filter(l=>!ee.categoryId||String(l.categoryId).toLowerCase().includes(ee.categoryId.toLowerCase())).filter(l=>ee.type==="all"||String(l.ledgerType||l.type)===ee.type||String(l.type)===ee.type).filter(l=>ee.reviewStatus==="all"||String(l.reviewStatus||"clear")===ee.reviewStatus).filter(l=>r?[l.description,l.accountName,l.fromAccountName,l.toAccountName,l.categoryId].some(u=>String(u||"").toLowerCase().includes(r)):!0).filter(l=>{const u=window.FinanceDates?.toDateOnly?.(l.timestamp)||"";return(!n||u>=n)&&(!a||u<=a)});return`
    <div class="modal-form">
      <h2 id="modal-title">Transactions</h2>
      <p class="modal-copy">A searchable raw log. Use it as evidence for the Observatory, not as the center of the product.</p>
      <div class="modal-grid-two">
        ${[["Truly available",De(e.trulyAvailableCash??e.realBalance)],["Reserved",De(e.reservedCash??0)],["Total cash",De(e.totalCash??e.realBalance)],["Monthly burn",De(e.monthlyBurn)],["Runway",e.runwayMonths==null?"Unknown":`${Number(e.runwayMonths).toFixed(1)} months`],["Debt remaining",De(e.debtRemaining??e.totalDebt)]].map(([l,u])=>`
          <div class="form-group"><label>${l}</label><input aria-label="${l}" value="${D(u)}" readonly /></div>
        `).join("")}
      </div>
      <div class="modal-section">
        <div class="ui-title">Filter ledger</div>
        <div class="modal-grid-three">
          <input id="modal-filter-search" aria-label="Search transactions" value="${D(ee.search)}" placeholder="Search note, account, category" />
          <select id="modal-filter-account" aria-label="Filter by account">${vt(ee.accountId)}</select>
          <select id="modal-filter-scope" aria-label="Filter by scope">${oi(ee.scope)}</select>
          <input id="modal-filter-category" aria-label="Filter by category" value="${D(ee.categoryId)}" placeholder="Category" />
          <select id="modal-filter-type" aria-label="Filter by type">
            <option value="all"${ee.type==="all"?" selected":""}>All types</option>
            <option value="income"${ee.type==="income"?" selected":""}>Income</option>
            <option value="expense"${ee.type==="expense"?" selected":""}>Expense</option>
            <option value="transfer"${ee.type==="transfer"?" selected":""}>Transfer</option>
            <option value="adjustment"${ee.type==="adjustment"?" selected":""}>Adjustment</option>
          </select>
          <select id="modal-filter-review-status" aria-label="Filter by review status">
            <option value="all"${ee.reviewStatus==="all"?" selected":""}>All review states</option>
            <option value="clear"${ee.reviewStatus==="clear"?" selected":""}>Clear</option>
            <option value="needs_review"${ee.reviewStatus==="needs_review"?" selected":""}>Needs review</option>
            <option value="reviewed"${ee.reviewStatus==="reviewed"?" selected":""}>Reviewed</option>
          </select>
          <input id="modal-filter-date-from" aria-label="Date from" type="date" value="${D(ee.dateFrom)}" />
          <input id="modal-filter-date-to" aria-label="Date to" type="date" value="${D(ee.dateTo)}" />
          <button class="ui-btn ui-btn--secondary" type="button" data-action="refreshTransactionsModal">Apply filters</button>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="exportTransactionsCsv">Export CSV</button>
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Ledger entries</div>
        ${d.length?d.map(l=>{const u=si(l),S=u>=0,b=l.ledgerType==="transfer"?`${D(l.fromAccountName||"From account")} → ${D(l.toAccountName||"To account")}`:D(l.accountName||"Unassigned");return`
          <div class="modal-list-row">
            <span><strong>${D(l.description||l.type)}</strong><br><small>${b} · ${D(l.categoryId||"uncategorized")} · ${D(l.reviewStatus||"clear")} · ${ht(l.timestamp)}</small></span>
            <span>${ri(l.ledgerType||l.type)}${l.obligationId?` · ${D(l.obligationTitle||l.obligationId)}`:""}</span>
            <span class="${S?"fin-val-pos":"fin-val-neg"}">${S?"+":"-"}${De(Math.abs(u))}</span>
            <button class="fin-mini-btn" type="button" data-action="deleteTransaction" data-action-args="'${D(l.id)}'" aria-label="Reverse transaction">Reverse</button>
          </div>
        `}).join(""):`<div class="fin-compact-empty">${(t.transactions||[]).length?"No transactions match these filters.":"No transactions yet. Add a cash account, then record one real movement."}</div>`}
      </div>
      <div class="modal-section">
        <div class="ui-title">Add transaction</div>
        <div class="modal-grid-three">
          <select id="modal-txn-type" aria-label="Transaction type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <input id="modal-txn-desc" aria-label="Transaction note" placeholder="Note" data-autofocus />
          <input id="modal-txn-amount" aria-label="Transaction amount" type="number" min="0" step="0.01" placeholder="Positive amount" />
          <input id="modal-txn-date" aria-label="Transaction date" type="date" value="${st()}" />
          <select id="modal-txn-account" aria-label="Transaction account">${vt("",!1)}</select>
          <select id="modal-txn-to-account" aria-label="Transfer destination account">${vt("",!1)}</select>
          <select id="modal-txn-direction" aria-label="Adjustment direction"><option value="increase">Increase account</option><option value="decrease">Decrease account</option></select>
          <input id="modal-txn-category" aria-label="Transaction category" placeholder="Category" value="uncategorized" />
          <select id="modal-txn-scope" aria-label="Transaction scope">${dt("business")}</select>
        </div>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="addTransaction">Add transaction</button>
      </div>
    </div>
  `}function pi(e="expense"){return li(e,{accountOptions:vt,today:st})}function fi(e=""){const t=(G.getFinancialReadModel().pipelineDeals||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark pipeline item as paid</h2>
      <p class="modal-copy">${D(t?.title||"Pipeline item")} · ${De(t?.value)}</p>
      <input id="modal-settle-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-settle-account">Settlement account</label><select id="modal-settle-account">${vt(String(t?.destinationAccountId||""),!1)}</select></div>
      ${Re("settleIncome")}
    </div>
  `}function gi(){const e=G.getFinancialReadModel(),t=G.getFinancialSnapshot(),n=G.getReviewState(),a=e.fiatAccounts||[],r=[["unresolvedItems","1. Resolve unclear items",t.attentionQueue?t.attentionQueue.filter(d=>d.type==="Needs review").length===0:!0,"Categorize or clarify any ambiguous transactions."],["matchPayments","2. Match payments",!0,"Link incoming cash to expected invoices."],["confirmObligations","3. Confirm obligations",t.attentionQueue?t.attentionQueue.filter(d=>d.type==="Due soon"||d.type==="Overdue").length===0:!0,"Mark due costs as paid or deferred."],["reviewSignals","4. Review signals",Number(t.runwayMonths)>=3,"Inspect runway, low points, and missing inputs."],["closeMonth","5. Close month",!0,"Lock the prior month and reset operating cycle."]];return`
    <div class="modal-form">
      <h2 id="modal-title">Monthly review</h2>
      <p class="modal-copy">A 5-step flow to verify your treasury.</p>
      <div class="modal-section">
        <div class="ui-title">Reconcile account balances</div>
        <div class="review-grid">
          ${a.length?a.map((d,l)=>`
            <label class="review-row">
              <input id="modal-review-account-${l}" class="review-account-check" type="checkbox" data-account-id="${D(d.id)}" />
              <span><strong>${D(d.name)}</strong><small>${D(d.scope||"shared")} · Confirm the live balance</small></span>
              <input id="modal-review-balance-${l}" class="review-balance-input" aria-label="${D(d.name)} reconciled balance" type="number" step="0.01" value="${D(d.balance)}" />
            </label>
          `).join(""):'<div class="fin-compact-empty">Add a cash account before completing a review.</div>'}
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Operating checks</div>
        <div class="review-grid">
        ${r.map(([d,l,u,S])=>`
          <label class="review-row ${u?"is-complete":""}">
            <input id="modal-review-${d}" type="checkbox" />
            <span><strong>${l}</strong><small>${S}</small></span>
          </label>
        `).join("")}
        </div>
      </div>
      <div class="form-group"><label for="modal-review-notes">Review notes</label><textarea id="modal-review-notes" rows="3" placeholder="What changed, what needs attention?">${D(n.notes)}</textarea></div>
      <p class="modal-copy">Last reviewed: ${n.lastReviewedAt?ht(n.lastReviewedAt):"Not reviewed yet"}</p>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Later</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="completeWeeklyReview">Mark review complete</button>
      </div>
    </div>
  `}function vi(){const e=G.getGoalProgress();return`
    <div class="modal-form">
      <h2 id="modal-title">Savings and buffer goals</h2>
      <p class="modal-copy">Progress is derived from the current balances of linked cash accounts.</p>
      <div class="modal-section">
        ${e.length?e.map(t=>`
          <div class="modal-list-row">
            <span><strong>${D(t.name)}</strong><br><small>${D(t.type)} · ${Math.round(t.progressPercent)}% · ${De(t.currentAmount)} of ${De(t.targetAmount)}</small></span>
            <span class="goal-modal-actions">
              <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'goal', '${D(t.id)}'">Edit</button>
              <button class="fin-mini-btn" type="button" data-action="deleteGoal" data-action-args="'${D(t.id)}'">Delete</button>
            </span>
          </div>
        `).join(""):'<div class="fin-compact-empty">No goals yet. Add a safety buffer or a savings target.</div>'}
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Close</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="openEditModal" data-action-args="'goal'">Add goal</button>
      </div>
    </div>
  `}function bi(e=""){const t=G.getGoals().goals.find(a=>a.id===e),n=G.getFinancialReadModel().fiatAccounts||[];return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit goal":"Add savings goal"}</h2>
      <p class="modal-copy">Link one or more cash accounts. Their balances become this goal's live progress.</p>
      <input id="modal-goal-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-goal-name">Goal name</label><input id="modal-goal-name" value="${D(t?.name||"")}" placeholder="Emergency buffer" /></div>
        <div class="form-group"><label for="modal-goal-type">Goal type</label><select id="modal-goal-type"><option value="buffer"${t?.type==="buffer"?" selected":""}>Buffer</option><option value="savings"${t?.type==="savings"?" selected":""}>Savings</option></select></div>
        <div class="form-group"><label for="modal-goal-target">Target amount</label><input id="modal-goal-target" type="number" step="0.01" min="0.01" value="${D(t?.targetAmount||"")}" /></div>
        <div class="form-group"><label for="modal-goal-date">Target date</label><input id="modal-goal-date" type="date" value="${D(t?.targetDate||"")}" /></div>
        <div class="form-group"><label for="modal-goal-scope">Scope</label><select id="modal-goal-scope">${dt(t?.scope||"shared")}</select></div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Linked cash accounts</div>
        <div class="goal-account-grid">
          ${n.length?n.map((a,r)=>`
            <label class="settings-check goal-account-check">
              <input id="modal-goal-account-${r}" type="checkbox" value="${D(a.id)}"${t?.linkedAccountIds.includes(String(a.id))?" checked":""} />
              <span>${D(a.name)} · ${De(a.balance)}</span>
            </label>
          `).join(""):'<div class="fin-compact-empty">Add a cash account before linking progress.</div>'}
        </div>
      </div>
      ${Re("goal",!!t)}
    </div>
  `}function hi(){const e=!!He,t=!!Ve,n=Ve?.rows||[],a=Ve?.rejected||[],r=Ve?.duplicates||[];return`
    <div class="modal-form">
      <h2 id="modal-title">Import transactions from CSV</h2>
      <p class="modal-copy">Choose a local transaction CSV or paste CSV data. Map a signed amount column, or separate debit and credit columns, before importing.</p>
      <div class="csv-source-grid">
        <div class="form-group">
          <label for="modal-csv-file">CSV file</label>
          <div class="csv-file-actions">
            <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseCsvImport">Choose CSV file</button>
            <span>${D(Cn)}</span>
          </div>
          <input id="modal-csv-file" type="file" accept=".csv,text/csv,text/plain" hidden />
        </div>
        <div class="form-group">
          <label for="modal-csv-account">Destination account</label>
          <select id="modal-csv-account">${vt(nn,!1)}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="modal-csv-text">CSV data</label>
        <textarea id="modal-csv-text" rows="7" placeholder="date,description,amount,category,scope">${D(Bt)}</textarea>
      </div>
      ${e?`
        <div class="modal-section">
          <div class="ui-title">Detected columns · ${ii(He?.delimiter||",")} separated</div>
          <div class="csv-columns">${He?.headers.map(d=>`<code>${D(d)}</code>`).join("")}</div>
          <div class="csv-mapping-grid">
            <div class="form-group"><label for="modal-csv-map-date">Date *</label><select id="modal-csv-map-date">${kt(rt.date,"Choose date column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-description">Description *</label><select id="modal-csv-map-description">${kt(rt.description,"Choose description column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-amount">Signed amount</label><select id="modal-csv-map-amount">${kt(rt.amount)}</select></div>
            <div class="form-group"><label for="modal-csv-map-debit">Debit</label><select id="modal-csv-map-debit">${kt(rt.debit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-credit">Credit</label><select id="modal-csv-map-credit">${kt(rt.credit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-category">Category</label><select id="modal-csv-map-category">${kt(rt.category)}</select></div>
            <div class="form-group"><label for="modal-csv-map-scope">Scope</label><select id="modal-csv-map-scope">${kt(rt.scope)}</select></div>
            <div class="form-group"><label for="modal-csv-default-category">Default category</label><input id="modal-csv-default-category" value="${D(ln)}" /></div>
            <div class="form-group"><label for="modal-csv-default-scope">Default scope</label><select id="modal-csv-default-scope">${dt(dn)}</select></div>
          </div>
        </div>
      `:""}
      ${gt?`<div class="fin-compact-empty" role="alert">${D(gt)}</div>`:""}
      ${t?`
        <div class="modal-section">
          <div class="ui-title">Import preview</div>
          <div class="csv-preview-counts">
            <span>${n.length} accepted</span>
            <span>${r.length} duplicate${r.length===1?"":"s"}</span>
            <span>${a.length} rejected</span>
          </div>
          ${n.slice(0,6).map(d=>`<div class="modal-list-row"><span>${D(d.description)}<br><small>${D(d.date)} · ${D(d.categoryId)} · ${D(d.scope)}</small></span><span class="${d.amount>=0?"fin-val-pos":"fin-val-neg"}">${De(d.amount)}</span></div>`).join("")}
          ${r.length?`<div class="csv-validation-list"><strong>Duplicates skipped</strong>${r.slice(0,4).map(d=>`<span>${D(d.date)} · ${D(d.description)}</span>`).join("")}</div>`:""}
          ${a.length?`<div class="csv-validation-list csv-validation-list--error"><strong>Rejected rows</strong>${a.slice(0,6).map(d=>`<span>Row ${d.rowNumber}: ${D(d.reason)}</span>`).join("")}</div>`:""}
        </div>
      `:""}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="analyzeCsvImport">Analyze CSV</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="previewCsvImport"${e?"":" disabled"}>Preview import</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="importCsvData"${n.length?"":" disabled"}>Import valid rows</button>
      </div>
    </div>
  `}function yi(){const e=Yt,t=e?.counts||{},n=e?.warnings||[];return`
    <div class="modal-form">
      <h2 id="modal-title">Restore Finance Master backup</h2>
      <p class="modal-copy">Review this backup before replacement. Restoring replaces your current local finance data, goals, settings, review state, import history, and cached prices.</p>
      <div class="csv-file-actions">
        <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseFinanceBackup">Choose backup file</button>
        <input id="modal-backup-file" type="file" accept="application/json,.json" hidden />
      </div>
      ${e?.valid?`
        <div class="backup-preview-card">
          <div><span>App</span><strong>${D(e.appName||"Finance Master")}</strong></div>
          <div><span>Backup version</span><strong>${D(e.version||"Unknown")}</strong></div>
          <div><span>Schema</span><strong>${D(e.schemaLabel||"Unknown")}</strong></div>
          <div><span>Exported</span><strong>${ht(e.exportedAt)}</strong></div>
          <div><span>Latest event</span><strong>${ht(e.latestLocalEventAt)}</strong></div>
          <div><span>Ledger events</span><strong>${t.ledgerEvents||0}</strong></div>
          <div><span>Accounts</span><strong>${t.accounts||0}</strong></div>
          <div><span>Recurring costs</span><strong>${t.recurringCosts||0}</strong></div>
          <div><span>Pipeline items</span><strong>${t.pipelineItems||0}</strong></div>
          <div><span>Goals</span><strong>${t.goals||0}</strong></div>
          <div><span>CSV batches</span><strong>${t.importBatches||0}</strong></div>
          <div><span>Cached local values</span><strong>${t.cachedQuotes||0}</strong></div>
        </div>
        ${n.length?`
          <div class="csv-validation-list" role="alert">
            ${n.map(a=>`<span>${D(a)}</span>`).join("")}
          </div>
        `:""}
        <p class="modal-copy"><strong>Restore warning:</strong> clicking replace permanently overwrites the current local Finance Master data in this browser.</p>
      `:`
        <div class="csv-validation-list csv-validation-list--error" role="alert">
          <strong>This backup cannot be restored</strong>
          ${(e?.errors||["Choose a Finance Master backup file."]).map(a=>`<span>${D(a)}</span>`).join("")}
        </div>
      `}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="applyBackupRestore"${e?.valid?"":" disabled"}>Replace current data</button>
      </div>
    </div>
  `}function vt(e="",t=!0){const n=G.getFinancialReadModel().fiatAccounts||[];return!n.length&&!t?'<option value="">Operating cash (created on save)</option>':`${t?'<option value="">All accounts</option>':'<option value="">Choose an account</option>'}${n.map(r=>`
    <option value="${D(r.id)}"${String(r.id)===e?" selected":""}>${D(r.name)} · ${D(r.scope||"shared")}</option>
  `).join("")}`}function wi(e=""){const t=(G.getFinancialReadModel().pipelineDeals||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit income":"Add income"}</h2>
      <p class="modal-copy">Use status to separate reality from hope: confirmed, expected, or risky.</p>
      <input id="modal-income-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-income-title">Source</label><input id="modal-income-title" value="${D(t?.title||"")}" placeholder="Client or opportunity" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-income-amount">Amount</label><input id="modal-income-amount" type="number" step="0.01" value="${D(t?.value||"")}" /></div>
        <div class="form-group"><label for="modal-income-probability">Probability</label><input id="modal-income-probability" type="number" min="0" max="1" step="0.05" value="${D(t?.probability??.65)}" /></div>
        <div class="form-group"><label for="modal-income-date">Expected date</label><input id="modal-income-date" type="date" value="${D(t?.expectedDateISO||st())}" /></div>
        <div class="form-group"><label for="modal-income-status">Status</label><select id="modal-income-status">${["confirmed","expected","risky"].map(n=>`<option${t?.status===n?" selected":""}>${n}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-scenario">Scenario Inclusion</label><select id="modal-income-scenario">${["realistic","conservative","optimistic","all"].map(n=>`<option${(t?.scenarioInclusion||"realistic")===n?" selected":""}>${n}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-scope">Scope</label><select id="modal-income-scope">${dt(String(t?.scope||"business"))}</select></div>
      </div>
      <div class="form-group"><label for="modal-income-account">Settlement account</label><select id="modal-income-account">${vt(String(t?.destinationAccountId||""))}</select></div>
      ${Re("income",!!t)}
    </div>
  `}function Si(e=""){const t=(G.getFinancialReadModel().fiatAccounts||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit cash account":"Add cash account"}</h2>
      <input id="modal-fiat-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-fiat-name">Name</label><input id="modal-fiat-name" value="${D(t?.name||"")}" placeholder="Operating cash" /></div>
      <div class="form-group"><label for="modal-fiat-balance">Balance</label><input id="modal-fiat-balance" type="number" step="0.01" value="${D(t?.balance||"")}" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-fiat-scope">Scope</label><select id="modal-fiat-scope">${dt(String(t?.scope||"business"))}</select></div>
        <div class="form-group"><label for="modal-fiat-bucket">Bucket</label><select id="modal-fiat-bucket">
          ${[["available","Available cash"],["tax_reserve","Tax reserve"],["vat_reserve","VAT reserve"],["health_insurance","Health insurance"],["debt_repayment","Debt repayment"],["personal_survival","Personal survival"],["business_operating_costs","Business operating costs"],["buffer","Buffer"]].map(([n,a])=>`<option value="${n}"${String(t?.bucket||"available")===n?" selected":""}>${a}</option>`).join("")}
        </select></div>
      </div>
      ${Re("fiatAccount",!!t)}
    </div>
  `}function Ai(e=""){const t=(G.getFinancialReadModel().reserveBuckets||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit reserve bucket":"Add reserve bucket"}</h2>
      <input id="modal-reserve-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-reserve-name">Name</label><input id="modal-reserve-name" value="${D(t?.name||"")}" placeholder="Tax Reserve 2026" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-reserve-target">Target amount</label><input id="modal-reserve-target" type="number" step="0.01" value="${D(t?.targetAmount||"")}" /></div>
        <div class="form-group"><label for="modal-reserve-current">Current amount</label><input id="modal-reserve-current" type="number" step="0.01" value="${D(t?.currentAmount||0)}" /></div>
        <div class="form-group"><label for="modal-reserve-purpose">Purpose</label><select id="modal-reserve-purpose">
          ${[["tax_reserve","Taxes"],["vat_reserve","VAT"],["health_insurance","Health insurance"],["debt_repayment","Debt repayment"],["personal_survival","Personal survival"],["buffer","Buffer"],["custom","Custom"]].map(([n,a])=>`<option value="${n}"${String(t?.purpose||"tax_reserve")===n?" selected":""}>${a}</option>`).join("")}
        </select></div>
        <div class="form-group"><label for="modal-reserve-priority">Priority</label><select id="modal-reserve-priority">
          ${[["critical","Critical (Must fill)"],["high","High"],["medium","Medium"],["low","Low (If surplus)"]].map(([n,a])=>`<option value="${n}"${String(t?.priority||"high")===n?" selected":""}>${a}</option>`).join("")}
        </select></div>
      </div>
      ${Re("reserveBucket",!!t)}
    </div>
  `}function Ii(){return`
    <div class="modal-form">
      <h2 id="modal-title">Allocate Cash</h2>
      <p class="modal-copy">Move available cash into reserve buckets to protect it.</p>
      <div class="modal-section">
        <div class="form-group"><label for="modal-allocate-amount">Amount</label><input id="modal-allocate-amount" type="number" step="0.01" placeholder="0.00" /></div>
        <div class="form-group"><label for="modal-allocate-bucket">To bucket</label><select id="modal-allocate-bucket">
          ${(G.getFinancialReadModel().reserveBuckets||[]).map(t=>`<option value="${D(t.id)}">${D(t.name)} (${De(t.currentAmount)} of ${De(t.targetAmount)})</option>`).join("")}
        </select></div>
      </div>
      ${Re("allocateReserves")}
    </div>
  `}function $i(e=""){const t=(G.getFinancialReadModel().recurringExpenses||[]).find(a=>String(a.id)===e);let n=t?.monthlyAmount||"";return t&&t.monthlyAmount&&(t.frequency==="quarterly"&&(n=t.monthlyAmount*3),t.frequency==="semi-annually"&&(n=t.monthlyAmount*6),t.frequency==="annually"&&(n=t.monthlyAmount*12)),`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit recurring cost":"Add recurring cost"}</h2>
      <p class="modal-copy">Recurring costs become upcoming obligations and shape runway.</p>
      <input id="modal-expense-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-expense-category">Name</label><input id="modal-expense-category" value="${D(t?.category||"")}" placeholder="Health insurance or studio rent" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-amount">Amount</label><input id="modal-expense-amount" type="number" step="0.01" value="${D(n)}" /></div>
        <div class="form-group"><label for="modal-expense-frequency">Frequency</label><select id="modal-expense-frequency">
          <option value="monthly"${t?.frequency==="monthly"?" selected":""}>Monthly</option>
          <option value="quarterly"${t?.frequency==="quarterly"?" selected":""}>Quarterly</option>
          <option value="semi-annually"${t?.frequency==="semi-annually"?" selected":""}>Semi-annually</option>
          <option value="annually"${t?.frequency==="annually"?" selected":""}>Annually</option>
        </select></div>
      </div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-due-day">Due day</label><input id="modal-expense-due-day" type="number" min="1" max="28" value="${D(t?.dueDay||1)}" /></div>
        <div class="form-group"><label for="modal-expense-scope">Scope</label><select id="modal-expense-scope">${dt(String(t?.scope||"personal"))}</select></div>
      </div>
      <label class="settings-check"><input id="modal-expense-essential" type="checkbox"${t?.essential?" checked":""} /><span>Essential expense</span></label>
      <div class="modal-actions">${ea("deactivateRecurringExpense",!!t)}<span class="modal-actions-spacer"></span>${Re("expense",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function Di(e,t=""){const n=G.getFinancialReadModel().debtAccounts||[];if(e==="debtPayment")return n.length?`
      <div class="modal-form">
        <h2 id="modal-title">Record debt payment</h2>
        <div class="form-group"><label for="modal-debt-payment-id">Debt</label><select id="modal-debt-payment-id">${n.map(r=>`<option value="${D(r.id)}">${D(r.name)} (${De(r.outstanding)})</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-debt-payment-amount">Payment</label><input id="modal-debt-payment-amount" type="number" step="0.01" /></div>
        ${Re("debtPayment")}
      </div>
    `:`
        <div class="modal-form">
          <h2 id="modal-title">Record debt payment</h2>
          <p class="modal-copy">Add a debt item first, then payments can reduce its remaining balance.</p>
          <div class="fin-compact-empty">No debts are tracked yet.</div>
          <div class="modal-actions">
            <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Close</button>
            <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="openEditModal" data-action-args="'debtAdd'">Add debt item</button>
          </div>
        </div>
      `;const a=n.find(r=>String(r.id)===t);return`
    <div class="modal-form">
      <h2 id="modal-title">${a?"Add to debt":"Add debt"}</h2>
      <input id="modal-debt-id" type="hidden" value="${D(a?.id||"")}" />
      <div class="form-group"><label for="modal-debt-name">Name</label><input id="modal-debt-name" value="${D(a?.name||"")}" placeholder="Credit line" /></div>
      <div class="form-group"><label for="modal-debt-amount">${a?"Additional amount":"Amount"}</label><input id="modal-debt-amount" type="number" step="0.01" /></div>
      <div class="form-group"><label for="modal-debt-scope">Scope</label><select id="modal-debt-scope">${dt(String(a?.scope||"business"))}</select></div>
      <div class="modal-actions">${ea("deactivateDebtAccount",!!a)}<span class="modal-actions-spacer"></span>${Re("debtAdd",!!a).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function na(e){return((G.computeFinanceContext(!0).treasury||{}).obligations||[]).find(n=>String(n.id||"")===String(e||""))||null}function Mi(e=""){const t=na(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark obligation paid</h2>
      <p class="modal-copy">${D(t?.title||"Obligation")} · ${De(t?.amount)} · due ${ht(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-obligation-account">Paid from account</label><select id="modal-obligation-account">${vt("",!1)}</select></div>
        <div class="form-group"><label for="modal-obligation-paid-at">Payment date</label><input id="modal-obligation-paid-at" type="date" value="${D(String(t?.dueDate||st()).slice(0,10))}" /></div>
        <div class="form-group"><label for="modal-obligation-amount">Amount</label><input id="modal-obligation-amount" type="number" step="0.01" value="${D(t?.amount||"")}" /></div>
      </div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Optional note for the review trail"></textarea></div>
      ${Re("obligationPayment")}
    </div>
  `}function xi(e=""){const t=na(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Defer obligation</h2>
      <p class="modal-copy">${D(t?.title||"Obligation")} · current due date ${ht(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-obligation-deferred-until">New due date</label><input id="modal-obligation-deferred-until" type="date" value="${st()}" /></div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Why is this deferred?"></textarea></div>
      ${Re("obligationDefer")}
    </div>
  `}function aa(e){return(G.getFinancialReadModel().transactions||[]).find(t=>String(t.id)===String(e||"")||String(t.transactionEntityId||"")===String(e||""))||null}function Ni(e=""){return`<option value="">Choose obligation</option>${((G.computeFinanceContext(!0).treasury||{}).obligations||[]).filter(n=>String(n.status||"")!=="paid"&&String(n.type||"")!=="debt").map(n=>`
    <option value="${D(n.id)}"${String(n.id)===e?" selected":""}>${D(n.title)} · ${ht(n.dueDate)} · ${De(n.amount)}</option>
  `).join("")}`}function Ci(e=""){const t=aa(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Categorize transaction</h2>
      <p class="modal-copy">${D(t?.description||"Transaction")} · ${De(t?.amount)} · ${ht(t?.timestamp)}</p>
      <input id="modal-review-transaction-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-transaction-category">Category</label><input id="modal-review-transaction-category" value="${D(t?.categoryId==="uncategorized"?"":t?.categoryId||"")}" placeholder="software, tax, client-income" /></div>
        <div class="form-group"><label for="modal-review-transaction-scope">Scope</label><select id="modal-review-transaction-scope">${dt(String(t?.scope||"business"))}</select></div>
      </div>
      <div class="form-group"><label for="modal-review-transaction-notes">Review note</label><textarea id="modal-review-transaction-notes" rows="2" placeholder="Optional note for why this is clear"></textarea></div>
      ${Re("transactionReview")}
    </div>
  `}function Fi(e=""){const t=aa(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Match payment to obligation</h2>
      <p class="modal-copy">${D(t?.description||"Payment")} · ${De(t?.amount)} · ${ht(t?.timestamp)}</p>
      <input id="modal-match-transaction-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-match-obligation-id">Obligation</label><select id="modal-match-obligation-id">${Ni("")}</select></div>
      <div class="form-group"><label for="modal-match-notes">Review note</label><textarea id="modal-match-notes" rows="2" placeholder="Optional note for the match"></textarea></div>
      ${Re("paymentMatch")}
    </div>
  `}function Ei(e=""){const t=(G.getFinancialReadModel().pipelineDeals||[]).find(a=>String(a.id)===e),n=String(t?.status||"expected").toLowerCase();return`
    <div class="modal-form">
      <h2 id="modal-title">Review pipeline item</h2>
      <p class="modal-copy">${D(t?.title||"Pipeline item")} · ${De(t?.value)}</p>
      <input id="modal-pipeline-review-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-pipeline-review-status">Status</label><select id="modal-pipeline-review-status">${["confirmed","expected","risky"].map(a=>`<option value="${a}"${n===a?" selected":""}>${a}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-pipeline-review-probability">Probability</label><input id="modal-pipeline-review-probability" type="number" min="0" max="1" step="0.05" value="${D(t?.probability??.65)}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-date">Expected date</label><input id="modal-pipeline-review-date" type="date" value="${D(t?.expectedDateISO||st())}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-account">Settlement account</label><select id="modal-pipeline-review-account">${vt(String(t?.destinationAccountId||""))}</select></div>
      </div>
      <div class="form-group"><label for="modal-pipeline-review-notes">Review note</label><textarea id="modal-pipeline-review-notes" rows="2" placeholder="What changed about this income?"></textarea></div>
      ${Re("pipelineReview")}
    </div>
  `}function ki(e=""){const t=(G.getFinancialReadModel().debtAccounts||[]).find(l=>String(l.id)===e),n=t?.planType||"regular",a=t?.frequency||"monthly",d=(t?.installments||[]).map((l,u)=>`
    <div class="custom-installment-row modal-grid-two" data-index="${u}" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
      <input type="date" class="modal-debt-plan-inst-date" value="${D(l.date)}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" value="${D(l.amount)}" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    </div>
  `).join("");return`
    <div class="modal-form">
      <h2 id="modal-title">Add debt payment plan</h2>
      <p class="modal-copy">${D(t?.name||"Debt item")} · ${De(t?.outstanding)} outstanding</p>
      <input id="modal-debt-plan-id" type="hidden" value="${D(e)}" />
      <div class="form-group">
        <label for="modal-debt-plan-type">Plan Type</label>
        <select id="modal-debt-plan-type" onchange="if(window.toggleDebtPlanType) window.toggleDebtPlanType(this.value)">
          <option value="regular"${n==="regular"?" selected":""}>Regular Frequencies</option>
          <option value="custom"${n==="custom"?" selected":""}>Custom Installments</option>
        </select>
      </div>

      <div id="modal-debt-plan-regular-section" style="display: ${n==="regular"?"block":"none"};">
        <div class="modal-grid-two">
          <div class="form-group"><label for="modal-debt-plan-frequency">Frequency</label>
            <select id="modal-debt-plan-frequency">
              <option value="weekly"${a==="weekly"?" selected":""}>Weekly</option>
              <option value="monthly"${a==="monthly"?" selected":""}>Monthly</option>
              <option value="quarterly"${a==="quarterly"?" selected":""}>Quarterly</option>
              <option value="annually"${a==="annually"?" selected":""}>Annually</option>
            </select>
          </div>
          <div class="form-group"><label for="modal-debt-plan-minimum">Minimum payment</label><input id="modal-debt-plan-minimum" type="number" min="0" step="0.01" value="${D(t?.minimumPayment||"")}" /></div>
        </div>
        <div class="form-group"><label for="modal-debt-plan-due-date">Next due date</label><input id="modal-debt-plan-due-date" type="date" value="${D(t?.dueDate||st())}" /></div>
      </div>

      <div id="modal-debt-plan-custom-section" style="display: ${n==="custom"?"block":"none"};">
        <div class="form-group">
          <label>Installments</label>
          <div id="modal-debt-plan-custom-list">
            ${d}
          </div>
          <button type="button" class="btn-secondary ui-btn ui-btn--secondary" data-action="addCustomInstallment" style="margin-top: 0.5rem;">+ Add Installment</button>
        </div>
      </div>

      <div class="form-group"><label for="modal-debt-plan-note">Payment plan note <span class="fin-text-med">(optional)</span></label><textarea id="modal-debt-plan-note" rows="2" placeholder="Monthly minimum, creditor agreement, or next decision">${D(t?.paymentPlanNote||"")}</textarea></div>
      ${Re("debtPlan")}
    </div>
  `}function Ti(e,t=""){return e==="quickAdd"?ci():e==="transaction"?pi(t):e==="financeOverview"?mi():e==="weeklyReview"?gi():e==="goals"?vi():e==="goal"?bi(t):e==="csvImport"?hi():e==="backupRestore"?yi():e==="destructiveConfirm"?di():e==="settleIncome"?fi(t):e==="income"?wi(t):e==="fiatAccount"?Si(t):e==="reserveBucket"?Ai(t):e==="allocateReserves"?Ii():e==="web3Position"||e==="defiPosition"?'<div class="modal-form"><h2 id="modal-title">Postponed</h2><p class="modal-copy">Market portfolio tracking is outside the focused treasury MVP.</p></div>':e==="expense"?$i(t):e==="debtAdd"||e==="debtPayment"?Di(e,t):e==="obligationPayment"?Mi(t):e==="obligationDefer"?xi(t):e==="transactionReview"?Ci(t):e==="paymentMatch"?Fi(t):e==="pipelineReview"?Ei(t):e==="debtPlan"?ki(t):'<div class="modal-form"><h2 id="modal-title">Nothing to edit</h2></div>'}function Le(e,t={}){!Ke||!Mt||(!Ke.classList.contains("active")&&document.activeElement instanceof HTMLElement&&(In=document.activeElement),Ke.dataset.type=e,Ke.classList.add("active"),Ke.setAttribute("aria-hidden","false"),Mt.innerHTML=Ti(e,typeof t=="string"?t:String(t.id||"")),window.requestAnimationFrame(()=>{Mt.querySelector('[data-autofocus], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus()}))}function ot(e){Qt=e,Le("destructiveConfirm")}function Ge(){!Ke||!Mt||(Ke.classList.remove("active"),Ke.setAttribute("aria-hidden","true"),Mt.innerHTML="",Qt=null,In?.focus(),In=null)}function Tt(e,t){try{G.appendFinanceEvent(e,{source:t}),Ge()}catch(n){ae(n instanceof Error?n.message:"Could not save this finance entry.")}}function ia(e){const t=A(`${e}-type`)||"expense",n=A(`${e}-desc`),a=Math.abs(Number(A(`${e}-amount`))),r=A(`${e}-account`),l=!((G.getFinancialReadModel().fiatAccounts||[]).length>0)&&t!=="transfer";if(!Number.isFinite(a)||a<=0||!r&&!l)return ae(l?"Add a positive amount.":"Add a positive amount and an account."),!1;try{return t==="transfer"?G.recordTransfer({description:n,amount:a,timestamp:Vn(A(`${e}-date`)),fromAccountId:r,toAccountId:A(`${e}-to-account`),categoryId:A(`${e}-category`)||"transfer",scope:A(`${e}-scope`)}):G.recordLedgerTransaction({type:t==="income"||t==="adjustment"?t:"expense",description:n,amount:a,timestamp:Vn(A(`${e}-date`)),accountId:r,categoryId:A(`${e}-category`)||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),scope:A(`${e}-scope`),direction:A(`${e}-direction`)==="decrease"?"decrease":"increase"}),Ge(),!0}catch(u){return ae(u instanceof Error?u.message:"Could not add this transaction."),!1}}function bn(){Bt=A("modal-csv-text")||Bt,nn=A("modal-csv-account")||nn,ln=A("modal-csv-default-category")||ln,dn=A("modal-csv-default-scope")||dn,He&&(rt={date:A("modal-csv-map-date"),description:A("modal-csv-map-description"),amount:A("modal-csv-map-amount"),debit:A("modal-csv-map-debit"),credit:A("modal-csv-map-credit"),category:A("modal-csv-map-category"),scope:A("modal-csv-map-scope")})}function Oi(){const e=G.exportBackup(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=`finance-master-backup-${st()}.json`,n.click(),G.recordBackupExport(e.exportedAt),URL.revokeObjectURL(n.href)}function Ri(){const e=new Blob([G.exportTransactionsCsv()],{type:"text/csv;charset=utf-8"}),t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=`finance-master-transactions-${st()}.csv`,t.click(),URL.revokeObjectURL(t.href)}function _i(e){const t=G.getFinanceSettings().baseCurrency,n=new Date().toISOString();if(e==="transaction"){ia("modal-fast-txn");return}if(e==="income"){const a=Number(A("modal-income-amount")),r=Number(A("modal-income-probability"));if(!A("modal-income-title")||!Number.isFinite(a)||a===0||!Number.isFinite(r)||r<0||r>1){ae("Add an income source, a non-zero amount, and a probability between 0 and 1.");return}Tt({type:"pipeline.created",amount:Math.abs(a),currency:t,timestamp:n,related_entity_id:A("modal-income-id")||en("pipeline"),metadata:{title:A("modal-income-title"),value:Math.abs(a),probability:r,status:A("modal-income-status"),stage:A("modal-income-status"),scenarioInclusion:A("modal-income-scenario")||"realistic",expectedDateISO:A("modal-income-date"),destinationAccountId:A("modal-income-account"),scope:A("modal-income-scope")}},"modal.income");return}if(e==="fiatAccount"){const a=Number(A("modal-fiat-balance"));if(!A("modal-fiat-name")||!Number.isFinite(a)){ae("Add an account name and a valid balance.");return}const r=A("modal-fiat-bucket")||"available";Tt({type:"asset.account_set",amount:a,currency:t,timestamp:n,related_entity_id:A("modal-fiat-id")||en("cash"),metadata:{name:A("modal-fiat-name"),balance:a,active:!0,scope:A("modal-fiat-scope"),bucket:r,reserved:r!=="available"}},"modal.fiatAccount");return}if(e==="reserveBucket"){const a=Number(A("modal-reserve-target")),r=Number(A("modal-reserve-current"))||0;if(!A("modal-reserve-name")||!Number.isFinite(a)){ae("Add a name and a target amount.");return}Tt({type:"asset.reserve_set",amount:a,currency:t,timestamp:n,related_entity_id:A("modal-reserve-id")||en("reserve"),metadata:{name:A("modal-reserve-name"),targetAmount:a,currentAmount:r,purpose:A("modal-reserve-purpose"),priority:A("modal-reserve-priority"),active:!0}},"modal.reserveBucket");return}if(e==="allocateReserves"){const a=Number(A("modal-allocate-amount")),r=A("modal-allocate-bucket");if(!r||!Number.isFinite(a)||a<=0){ae("Enter a valid amount to allocate.");return}const d=(G.getFinancialReadModel().reserveBuckets||[]).find(l=>String(l.id)===r);if(!d){ae("Choose an existing reserve bucket before allocating cash.");return}Tt({type:"asset.reserve_allocated",amount:a,currency:t,timestamp:n,related_entity_id:r,metadata:{currentAmount:(Number(d.currentAmount)||0)+a}},"modal.allocateReserves");return}if(e==="expense"){const a=Math.abs(Number(A("modal-expense-amount"))),r=A("modal-expense-frequency")||"monthly";let d=a;r==="quarterly"&&(d=a/3),r==="semi-annually"&&(d=a/6),r==="annually"&&(d=a/12);const l=Number(A("modal-expense-due-day"));if(!A("modal-expense-category")||!Number.isFinite(a)||a<=0||!Number.isFinite(l)||l<1||l>28){ae("Add a cost name, positive amount, and due day from 1 to 28.");return}Tt({type:"expense.recurring_set",amount:a,currency:t,timestamp:n,related_entity_id:A("modal-expense-id")||en("expense"),metadata:{category:A("modal-expense-category"),monthlyAmount:d,essential:ta("modal-expense-essential"),active:!0,dueDay:l,frequency:r,scope:A("modal-expense-scope")}},"modal.expense");return}if(e==="debtAdd"){const a=Math.abs(Number(A("modal-debt-amount")));if(!A("modal-debt-name")||!Number.isFinite(a)||a<=0){ae("Add a debt name and a positive amount.");return}Tt({type:"debt.added",amount:a,currency:t,timestamp:n,related_entity_id:A("modal-debt-id")||en("debt"),metadata:{name:A("modal-debt-name"),scope:A("modal-debt-scope")}},"modal.debtAdd");return}if(e==="debtPayment"){const a=Math.abs(Number(A("modal-debt-payment-amount")));if(!A("modal-debt-payment-id")||!Number.isFinite(a)||a<=0){ae("Choose a debt item and enter a positive payment amount.");return}Tt({type:"debt.payment_made",amount:a,currency:t,timestamp:n,related_entity_id:A("modal-debt-payment-id"),metadata:{}},"modal.debtPayment");return}if(e==="obligationPayment"){const a=Math.abs(Number(A("modal-obligation-amount")));if(!A("modal-obligation-id")||!A("modal-obligation-account")||!Number.isFinite(a)||a<=0){ae("Choose an obligation, payment account, and positive amount.");return}try{G.reviewObligation({id:A("modal-obligation-id"),status:"paid",accountId:A("modal-obligation-account"),paidAt:A("modal-obligation-paid-at"),amount:a,notes:A("modal-obligation-notes")}),Ge()}catch(r){ae(r instanceof Error?r.message:"Could not mark this obligation paid.")}return}if(e==="obligationDefer"){if(!A("modal-obligation-id")||!A("modal-obligation-deferred-until")){ae("Choose an obligation and a new due date.");return}try{G.reviewObligation({id:A("modal-obligation-id"),status:"deferred",deferredUntil:A("modal-obligation-deferred-until"),notes:A("modal-obligation-notes")}),Ge()}catch(a){ae(a instanceof Error?a.message:"Could not defer this obligation.")}return}if(e==="transactionReview"){if(!A("modal-review-transaction-id")||!A("modal-review-transaction-category")){ae("Choose a transaction category before clearing this item.");return}try{G.reviewTransaction({id:A("modal-review-transaction-id"),categoryId:A("modal-review-transaction-category"),scope:A("modal-review-transaction-scope"),notes:A("modal-review-transaction-notes")}),Ge()}catch(a){ae(a instanceof Error?a.message:"Could not categorize this transaction.")}return}if(e==="paymentMatch"){if(!A("modal-match-transaction-id")||!A("modal-match-obligation-id")){ae("Choose a payment and an obligation to match.");return}try{G.matchTransactionToObligation({transactionId:A("modal-match-transaction-id"),obligationId:A("modal-match-obligation-id"),notes:A("modal-match-notes")}),Ge()}catch(a){ae(a instanceof Error?a.message:"Could not match this payment.")}return}if(e==="pipelineReview"){const a=Number(A("modal-pipeline-review-probability"));if(!A("modal-pipeline-review-id")||!A("modal-pipeline-review-date")||!Number.isFinite(a)||a<0||a>1){ae("Choose a pipeline item, expected date, and probability between 0 and 1.");return}try{G.updatePipelineReview({id:A("modal-pipeline-review-id"),status:A("modal-pipeline-review-status"),probability:a,expectedDateISO:A("modal-pipeline-review-date"),destinationAccountId:A("modal-pipeline-review-account"),notes:A("modal-pipeline-review-notes")}),Ge()}catch(r){ae(r instanceof Error?r.message:"Could not update this pipeline item.")}return}if(e==="debtPlan"){const a=A("modal-debt-plan-type")||"regular",r=A("modal-debt-plan-frequency"),d=Number(A("modal-debt-plan-minimum")),l=A("modal-debt-plan-due-date"),u=A("modal-debt-plan-note"),S=[];if(a==="custom"){const b=document.querySelectorAll(".modal-debt-plan-inst-date"),I=document.querySelectorAll(".modal-debt-plan-inst-amount");for(let w=0;w<b.length;w++)b[w].value&&Number(I[w].value)>0&&S.push({date:b[w].value,amount:Number(I[w].value)});if(S.length===0){ae("Add at least one valid installment for a custom plan.");return}}else if(!l||!Number.isFinite(d)||d<=0){ae("Add a due date and positive minimum payment.");return}if(!A("modal-debt-plan-id")){ae("Invalid debt ID.");return}try{G.saveDebtPlan({id:A("modal-debt-plan-id"),dueDate:l||S[0]?.date||new Date().toISOString(),minimumPayment:d||S[0]?.amount||0,paymentPlanNote:u,planType:a,frequency:r,installments:S}),Ge()}catch(b){ae(b instanceof Error?b.message:"Could not save this debt plan.")}return}if(e==="goal"){try{G.saveGoal({id:A("modal-goal-id")||void 0,name:A("modal-goal-name"),type:A("modal-goal-type")==="savings"?"savings":"buffer",targetAmount:Number(A("modal-goal-target")),targetDate:A("modal-goal-date")||void 0,scope:A("modal-goal-scope"),linkedAccountIds:[...document.querySelectorAll('[id^="modal-goal-account-"]:checked')].map(a=>a.value)}),Le("goals")}catch(a){ae(a instanceof Error?a.message:"Could not save this goal.")}return}if(e==="settleIncome"){if(!A("modal-settle-account")){ae("Choose a settlement account before marking this item as paid.");return}try{G.markPipelineItemPaid(A("modal-settle-id"),{destinationAccountId:A("modal-settle-account")}),Ge()}catch(a){ae(a instanceof Error?a.message:"Could not mark this income as paid.")}}}function Pi(e){const t=[];return e.replace(/'((?:\\.|[^'])*)'/g,(n,a)=>(t.push(a.replace(/\\'/g,"'").replace(/\\\\/g,"\\")),"")),t}function Bi(e){const t=e.split(".").reduce((n,a)=>!n||typeof n!="object"?null:n[a],window);return typeof t=="function"?t:null}function hn(e,t){const n=A(t);n&&ot({action:e,targetId:n,title:"Deactivate item",copy:"This archives the selected item from active finance calculations while keeping the event history.",phrase:"DEACTIVATE ITEM",buttonLabel:"Deactivate item"})}Object.assign(window,{openEditModal:Le,requestDestructiveConfirmation:ot,closeModal:Ge,saveFinanceModal:_i,addTransaction:()=>{ia("modal-txn")&&Le("financeOverview")},refreshTransactionsModal:()=>{ee.search=A("modal-filter-search"),ee.accountId=A("modal-filter-account"),ee.scope=A("modal-filter-scope")||"all",ee.categoryId=A("modal-filter-category"),ee.type=A("modal-filter-type")||"all",ee.reviewStatus=A("modal-filter-review-status")||"all",ee.dateFrom=A("modal-filter-date-from"),ee.dateTo=A("modal-filter-date-to"),Le("financeOverview")},deleteTransaction:e=>{e&&ot({action:"reverseTransaction",targetId:e,source:"modal.transaction.reverse",title:"Reverse transaction",copy:"This reverses the transaction and its linked account balance update.",phrase:"REVERSE TRANSACTION",buttonLabel:"Reverse transaction",reopenModal:"financeOverview"})},markAsPaid:e=>{Le("settleIncome",{id:e})},deleteInvoice:e=>{if(!e)return;const t=(G.getFinancialReadModel().invoices||[]).find(n=>String(n.id)===e);ot({action:"deleteInvoice",targetId:e,reverseSettlement:String(t?.status||"").toLowerCase()==="paid",title:"Archive income entry",copy:"This archives the selected pipeline or settlement entry. If it is settled, the linked settlement can be reversed as part of the archive.",phrase:"ARCHIVE INCOME ENTRY",buttonLabel:"Archive entry"})},markObligationNeedsReview:e=>{try{G.reviewObligation({id:e,status:"needs_review"})}catch(t){window.alert(t instanceof Error?t.message:"Could not update this obligation.")}},cancelPipelineFromReview:e=>{e&&ot({action:"cancelPipelineItem",targetId:e,source:"Cancelled during Review.",title:"Cancel pipeline item",copy:"This removes the selected pipeline item from expected income and forecast assumptions.",phrase:"CANCEL PIPELINE ITEM",buttonLabel:"Cancel pipeline item",renderAfter:!0})},toggleDebtPlanType:e=>{const t=document.getElementById("modal-debt-plan-regular-section"),n=document.getElementById("modal-debt-plan-custom-section");t&&(t.style.display=e==="regular"?"block":"none"),n&&(n.style.display=e==="custom"?"block":"none")},addCustomInstallment:()=>{const e=document.getElementById("modal-debt-plan-custom-list");if(!e)return;const t=e.children.length,n=document.createElement("div");n.className="custom-installment-row modal-grid-two",n.style.cssText="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;",n.dataset.index=String(t),n.innerHTML=`
      <input type="date" class="modal-debt-plan-inst-date" value="${st()}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" placeholder="Amount" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    `,e.appendChild(n)},deactivateFiatAccount:()=>hn("deactivateFiatAccount","modal-fiat-id"),deactivateRecurringExpense:()=>hn("deactivateRecurringExpense","modal-expense-id"),deactivateDebtAccount:()=>hn("deactivateDebtAccount","modal-debt-id"),resetDemoData:()=>{ot({action:"resetDemoData",title:"Restore sample data",copy:"This replaces the current local Finance Master ledger with the fictional sample data.",phrase:"RESTORE SAMPLE DATA",buttonLabel:"Restore sample data"})},deleteDemoData:()=>{ot({action:"deleteDemoData",title:"Delete sample data",copy:"This clears the fictional sample ledger from this browser. Your dashboard will be empty until you add entries or restore a backup.",phrase:"DELETE SAMPLE DATA",buttonLabel:"Delete sample data"})},resetLocalFinanceData:()=>{ot({action:"resetLocalFinanceData",title:"Reset local finance data",copy:"This clears only Finance Master local finance data in this browser, including ledger events, settings, review state, import history, goals, and cached local values.",phrase:"DELETE LOCAL FINANCE DATA",buttonLabel:"Reset local data"})},completeWeeklyReview:()=>{const e=[...document.querySelectorAll(".review-account-check")],t=["modal-review-unresolvedItems","modal-review-matchPayments","modal-review-confirmObligations","modal-review-reviewSignals","modal-review-closeMonth"];if(!e.length||e.some(a=>!a.checked)||t.some(a=>!ta(a))){ae("Confirm every account balance and complete each operating check before finishing the review.");return}const n=e.map((a,r)=>({accountId:a.dataset.accountId||"",rawBalance:A(`modal-review-balance-${r}`)}));if(n.some(a=>!a.rawBalance||!Number.isFinite(Number(a.rawBalance)))){ae("Add a valid balance for every reconciled account.");return}try{G.completeWeeklyReview({accounts:n.map(a=>({accountId:a.accountId,balance:Number(a.rawBalance)})),unresolvedItems:!0,matchPayments:!0,confirmObligations:!0,reviewSignals:!0,closeMonth:!0,notes:A("modal-review-notes")}),Ge()}catch(a){ae(a instanceof Error?a.message:"Could not complete this review.")}},deleteGoal:e=>{e&&ot({action:"deleteGoal",targetId:e,title:"Delete savings goal",copy:"This deletes the selected savings or buffer goal. It does not delete linked account balances.",phrase:"DELETE SAVINGS GOAL",buttonLabel:"Delete goal",reopenModal:"goals"})},exportFinanceBackup:()=>Oi(),exportTransactionsCsv:()=>Ri(),chooseFinanceBackup:()=>document.querySelector("#modal-backup-file")?.click(),undoImportBatch:e=>{e&&ot({action:"undoImportBatch",targetId:e,title:"Undo CSV import",copy:"This reverses the transactions imported in the selected CSV batch.",phrase:"UNDO CSV IMPORT",buttonLabel:"Undo import",renderAfter:!0})},chooseCsvImport:()=>document.querySelector("#modal-csv-file")?.click(),analyzeCsvImport:()=>{try{bn(),He=An(Bt),rt=Zn(He.headers),Ve=null,gt="",Le("csvImport")}catch(e){He=null,Ve=null,gt=e instanceof Error?e.message:"Could not parse this CSV.",Le("csvImport")}},previewCsvImport:()=>{try{bn(),He||(He=An(Bt));const e=G.getActiveFinanceEvents().map(t=>String(t.metadata?.fingerprint||"")).filter(Boolean);Ve=ai(He,rt,{existingFingerprints:e,defaultCategory:ln,defaultScope:dn,sourceFile:Cn}),gt="",Le("csvImport")}catch(e){Ve=null,gt=e instanceof Error?e.message:"Could not preview this CSV.",Le("csvImport")}},importCsvData:()=>{if(bn(),!nn){ae("Choose a destination account before importing.");return}if(!Ve?.rows.length){ae("Preview at least one valid, non-duplicate row before importing.");return}try{const e=G.importCsvTransactions(Ve.rows,{accountId:nn,sourceFile:Ve.sourceFile});gt=`Imported ${e.imported} row${e.imported===1?"":"s"}${e.duplicates?` · skipped ${e.duplicates} duplicate${e.duplicates===1?"":"s"}`:""}.`,Ve=null,Le("csvImport")}catch(e){ae(e instanceof Error?e.message:"Could not import this CSV.")}},applyBackupRestore:()=>{if(!Yt?.valid||!Rt){ae("Choose a valid Finance Master backup before restoring.");return}ot({action:"restoreBackup",title:"Replace local finance data",copy:"This replaces the current local Finance Master data in this browser with the selected backup.",phrase:"RESTORE LOCAL FINANCE DATA",buttonLabel:"Replace current data"})},applyDestructiveConfirmation:()=>{const e=Qt;if(!e){ae("Choose an action before confirming.");return}if(A("modal-destructive-phrase")!==e.phrase){ae("The confirmation phrase does not match.");return}try{if(e.action==="restoreBackup"){if(!Yt?.valid||!Rt)throw new Error("Choose a valid Finance Master backup before restoring.");G.restoreBackup(Rt),Rt=null,Yt=null}else if(e.action==="resetLocalFinanceData")G.resetLocalFinanceData();else if(e.action==="resetDemoData")G.clearAndReseedDemo();else if(e.action==="deleteDemoData")G.deleteSampleData();else if(e.action==="deactivateFiatAccount"||e.action==="deactivateRecurringExpense"||e.action==="deactivateDebtAccount"){if(!e.targetId)throw new Error("Choose an item before deactivating.");G[e.action](e.targetId)}else if(e.action==="reverseTransaction"){if(!e.targetId)throw new Error("Choose a transaction before reversing.");G.reverseTransaction(e.targetId,e.source||"modal.transaction.reverse")}else if(e.action==="deleteInvoice"){if(!e.targetId)throw new Error("Choose an income entry before archiving.");G.deleteInvoice(e.targetId,{reverseSettlement:e.reverseSettlement===!0})}else if(e.action==="cancelPipelineItem"){if(!e.targetId)throw new Error("Choose a pipeline item before cancelling.");G.cancelPipelineItem(e.targetId,e.source||"Cancelled.")}else if(e.action==="deleteGoal"){if(!e.targetId)throw new Error("Choose a goal before deleting.");G.deleteGoal(e.targetId)}else if(e.action==="undoImportBatch"){if(!e.targetId)throw new Error("Choose an import batch before undoing.");G.undoImportBatch(e.targetId)}const t=e.reopenModal,n=e.renderAfter===!0;Nn(G),Ge(),t&&Le(t),(n||!t)&&window.FinancialMode?.render?.()}catch(t){ae(t instanceof Error?t.message:"Could not complete this action.")}}});document.addEventListener("click",e=>{const t=e.target?.closest("[data-action]");if(!t)return;const n=t.dataset.action;n&&(e.preventDefault(),Bi(n)?.(...Pi(t.dataset.actionArgs||"")))});Ke?.addEventListener("click",e=>{e.target===Ke&&Ge()});document.addEventListener("keydown",e=>{if(!Ke?.classList.contains("active"))return;if(e.key==="Escape"){Ge();return}if(e.key!=="Tab")return;const t=[...Ke.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(r=>r.offsetParent!==null);if(!t.length)return;const n=t[0],a=t[t.length-1];Ke.contains(document.activeElement)?e.shiftKey&&document.activeElement===n?(e.preventDefault(),a.focus()):!e.shiftKey&&document.activeElement===a&&(e.preventDefault(),n.focus()):(e.preventDefault(),(e.shiftKey?a:n).focus())});document.addEventListener("input",e=>{e.target?.id==="modal-destructive-phrase"&&ui()});document.addEventListener("change",e=>{const t=e.target;if(!t?.files?.[0])return;const n=new FileReader;if(t.id==="modal-csv-file"){n.onload=()=>{try{Bt=String(n.result||""),Cn=t.files?.[0]?.name||"imported-transactions.csv",He=An(Bt),rt=Zn(He.headers),Ve=null,gt="",Le("csvImport")}catch(a){He=null,Ve=null,gt=a instanceof Error?a.message:"Could not parse this CSV file.",Le("csvImport")}},n.readAsText(t.files[0]);return}t.id==="modal-backup-file"&&(n.onload=()=>{try{Rt=JSON.parse(String(n.result||"")),Yt=G.previewBackup(Rt)}catch(a){Rt=null,Yt={valid:!1,counts:{},errors:[a instanceof Error?a.message:"Could not read this backup."]}}Le("backupRestore")},n.readAsText(t.files[0]))});function Li(e,t){const n={ledger:{title:"Transactions",copy:"Clean daily view, focused review work, and raw audit evidence when you need it.",sections:["ledger"]},invoices:{title:"Invoices",copy:"Expected income, confidence, overdue follow-up, and settlement into real cash.",sections:["invoices"]},planning:{title:"Cashflow Plan",copy:"Baseline, expected month, and conservative or optimistic scenarios for the next decisions.",sections:["scenarioOutcomes","cashCalendar","pipelineTabs","goals","projection","scenarioLab"]},review:{title:"Monthly Review",copy:"Resolve unclear items, reconcile accounts, and close the operating loop.",sections:["reviewQueue","obligationReview","paymentReview","tensionSignals","weeklyReview"]},reports:{title:"Reports",copy:"Patterns across cash rhythm, reserves, income concentration, and financial health.",sections:["reports"]},data:{title:"Import & Backup",copy:"Local imports, backups, import batches, and sample ledger controls.",sections:["data"]},settings:{title:"Settings",copy:"System preferences and local display controls.",sections:["settings"]},reserves:{title:"Cash & Reserves",copy:"Operating cash, tax reserves, and buffer accounts.",sections:["reserves"]},fixedCosts:{title:"Fixed Costs & Debt",copy:"Monthly burn rate, subscriptions, and outstanding debt.",sections:["fixedCosts"]}};return function(r){const d=n[r];return d?[t(d.title,d.copy),...d.sections.map(l=>e[l]())]:['<div class="fin-dashboard-main">',t("Overview","Your local-first treasury cockpit."),e.observatoryHeader(),e.dashboardCockpit(),e.attentionQueue(),e.next30Days(),"</div>"]}}function L(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Se(e){return String(e??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}function rn(e,t,n){const a=Number(e)||0;return`${a} ${a===1?t:n||`${t}s`}`}function Gn(e){return[["all","All scopes"],["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function ze(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"Not yet"}function Ie(e){return`<div class="fin-compact-empty">${L(e)}</div>`}function ji(e){const t=String(e||"").replace(/_/g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Review"}function $t(e){const t=String(e||"needs_review").toLowerCase();return`<span class="fin-status-pill fin-status-pill--${L(t)}">${L(ji(t))}</span>`}function Ui(e,t){return`
        <section class="fin-section fin-section-heading">
            <div class="fin-page-header">
                <h2 class="fin-page-title">${L(e)}</h2>
                <p class="fin-page-subtitle">${L(t)}</p>
            </div>
        </section>
    `}window.FinancialMode=(function(){let e=null,t=null,n=null,a=null,r=null,d=null,l={},u=!1,S={marketMajors:0,burnDelta:0,probFloor:50},b=!1;const I={focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",ledgerView:"finance-master.layout.ledger-view",ledgerFilters:"finance-master.layout.ledger-filters",invoicesView:"finance-master.layout.invoices-view",activeSection:"finance-master.layout.active-section"},w=["dashboard","ledger","invoices","planning","review","reports","data","settings","reserves","fixedCosts"],j={container:document.getElementById("dashboard-financial"),content:document.getElementById("fin-content-area"),switchBtns:document.querySelectorAll(".fin-switch-btn"),mobileNavToggle:document.querySelector('[data-action="FinancialMode.toggleMobileNav"]'),sidebar:document.querySelector(".finance-master-sidebar")};function J(c){return`finance-master.layout.collapsed.${String(c||"").trim()}`}function h(c,o){try{const m=localStorage.getItem(c);if(m==null)return!!o;if(m==="true")return!0;if(m==="false")return!1}catch{}return!!o}function g(c,o){try{localStorage.setItem(c,o?"true":"false")}catch{}}function M(){return h(I.focusMode,!1)}function F(c){g(I.focusMode,!!c)}function W(){try{const c=String(localStorage.getItem(I.pipelineTab)||"pipeline").toLowerCase();if(c==="pipeline"||c==="history"||c==="cashflow")return c}catch{}return"pipeline"}function E(c){const o=String(c||"").toLowerCase();if(!(o!=="pipeline"&&o!=="history"&&o!=="cashflow"))try{localStorage.setItem(I.pipelineTab,o)}catch{}}function C(){try{const c=String(localStorage.getItem(I.activeSection)||"dashboard"),o=c.toLowerCase();return o==="today"?"dashboard":o==="transactions"?"ledger":o==="cashflow"?"planning":o==="import"?"data":w.indexOf(c)!==-1?c:"dashboard"}catch{return"dashboard"}}function N(c){let o=String(c||"dashboard");const m=o.toLowerCase();m==="today"&&(o="dashboard"),m==="transactions"&&(o="ledger"),m==="cashflow"&&(o="planning"),m==="import"&&(o="data");const y=w.indexOf(o)!==-1?o:"dashboard";try{localStorage.setItem(I.activeSection,y)}catch{}be(),pe()}function R(){try{const c=String(localStorage.getItem(I.ledgerView)||"clean").toLowerCase();if(c==="clean"||c==="work"||c==="audit")return c}catch{}return"clean"}function te(c){const o=String(c||"clean").toLowerCase();if(!(o!=="clean"&&o!=="work"&&o!=="audit"))try{localStorage.setItem(I.ledgerView,o)}catch{}}function de(){try{const c=String(localStorage.getItem(I.invoicesView)||"open").toLowerCase();if(c==="open"||c==="settled"||c==="all")return c}catch{}return"open"}function ve(c){const o=String(c||"open").toLowerCase();if(!(o!=="open"&&o!=="settled"&&o!=="all"))try{localStorage.setItem(I.invoicesView,o)}catch{}}function Q(){return{search:"",accountId:"all",scope:"all",categoryId:"",type:"all",reviewStatus:"all",dateFrom:"",dateTo:""}}function P(){try{const c=JSON.parse(localStorage.getItem(I.ledgerFilters)||"{}");return Object.assign(Q(),c&&typeof c=="object"?c:{})}catch{return Q()}}function x(c){try{localStorage.setItem(I.ledgerFilters,JSON.stringify(Object.assign(Q(),c||{})))}catch{}}function B(){try{localStorage.removeItem(I.ledgerFilters)}catch{}}function Y(c){const o=K(e&&e.fiatAccounts);return[`<option value="all"${c==="all"||!c?" selected":""}>All accounts</option>`,...o.map(m=>`<option value="${L(m.id)}"${String(c)===String(m.id)?" selected":""}>${L(m.name||"Account")}</option>`)].join("")}function ie(c){document.querySelectorAll("[data-fin-nav]").forEach(o=>{const m=String(o.getAttribute("data-fin-nav")||"")===c;o.classList.toggle("active",m),o.setAttribute("aria-current",m?"page":"false")})}function X(c){const o=!!c,m=typeof window.matchMedia=="function"?window.matchMedia("(max-width: 760px)").matches:!1;document.body.classList.toggle("finance-nav-open",o),j.mobileNavToggle&&(j.mobileNavToggle.setAttribute("aria-expanded",o?"true":"false"),j.mobileNavToggle.setAttribute("aria-label",o?"Close navigation":"Open navigation")),j.sidebar&&(m&&!o?(j.sidebar.setAttribute("aria-hidden","true"),j.sidebar.setAttribute("inert","")):(j.sidebar.removeAttribute("aria-hidden"),j.sidebar.removeAttribute("inert")))}function Ce(){X(!document.body.classList.contains("finance-nav-open"))}function be(){X(!1)}function fe(c){return h(J(c),!0)}function $e(c,o){g(J(c),!!o)}function K(c){return Array.isArray(c)?c:[]}function ye(c,o={}){return typeof window.renderSAGIcon=="function"?window.renderSAGIcon(c,o):""}function q(c,o){if(!u&&(c==null||Number(c)===0)||c==null||!Number.isFinite(Number(c)))return"—";const m=window.Store&&typeof window.Store.getFinanceSettings=="function"?window.Store.getFinanceSettings().baseCurrency:"EUR";if(window.FinanceFormatting&&typeof window.FinanceFormatting.formatCurrencyAmount=="function")return window.FinanceFormatting.formatCurrencyAmount(c,{currency:o,baseCurrency:m});const y=o||m||"EUR";return new Intl.NumberFormat(void 0,{style:"currency",currency:y,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(c))}function tt(){const c=Number(t&&t.runwayMonths),o=Number(t&&t.confidenceScore),m=Array.isArray(t&&t.missingInputs)?t.missingInputs.length:0,y=String(n&&n.stressLevel||"").toLowerCase();return!u||!Number.isFinite(o)||o<.45||m>=3?{text:"Unclear",tone:"quiet",icon:"attention"}:!Number.isFinite(c)||c<4||y==="high"?{text:"Tight",tone:"fragmented",icon:"warning"}:c>=8&&y==="low"?{text:"Expanding",tone:"expanding",icon:"sprout"}:{text:"Stable",tone:"nourishing",icon:"success"}}function We(){const c=window.FinanceLedger&&typeof window.FinanceLedger.isPipelineActive=="function"?window.FinanceLedger.isPipelineActive:function(o){const m=String(o||"").toLowerCase();return m!=="paid"&&m!=="closed"&&m!=="lost"&&m!=="cancelled"&&m!=="deleted"};return K(e&&e.pipelineDeals).filter(o=>c(o&&o.status))}function Ye(){const c=K(e&&e.invoices).filter(p=>String(p&&p.status||"").toLowerCase()==="paid"),o=[];for(let p=5;p>=0;p-=1){const O=new Date;O.setMonth(O.getMonth()-p);const z=`${O.getFullYear()}-${String(O.getMonth()+1).padStart(2,"0")}`;o.push({key:z,label:O.toLocaleDateString(void 0,{month:"short"}),income:0,expense:0})}const m=new Map(o.map(p=>[p.key,p]));c.forEach(p=>{const O=Date.parse(p&&p.paidAt||p&&p.sentAt||"");if(!Number.isFinite(O))return;const z=new Date(O),oe=`${z.getFullYear()}-${String(z.getMonth()+1).padStart(2,"0")}`,we=m.get(oe);if(!we)return;const T=Math.abs(Number(p&&p.amount)||0);we.income+=T});const y=o.some(p=>p.income>0||p.expense>0),V=Math.max(1,...o.map(p=>Math.max(p.income,p.expense)));return{buckets:o,hasData:y,maxValue:V}}function Qe(c){const o=c||Ye();if(!o.hasData)return Ie("No cashflow history. Record your first operating month to unlock rhythms.");const m=100/Math.max(1,o.buckets.length);return`
            <div class="fin-rhythm">
                <div class="fin-muted fin-rhythm-label">Cashflow Rhythm (6 months)</div>
                <div class="fin-rhythm-bars">
                    ${o.buckets.map(y=>{const V=y.income>0?Math.max(2,y.income/o.maxValue*100):0,p=y.expense>0?Math.max(2,y.expense/o.maxValue*100):0;return`
                            <div class="fin-rhythm-month">
                                <div class="fin-rhythm-columns" style="--rhythm-width:${m}%">
                                    <span class="fin-rhythm-bar fin-rhythm-income" style="height:${V}%"></span>
                                    <span class="fin-rhythm-bar fin-rhythm-expense" style="height:${p}%"></span>
                                </div>
                                <span class="fin-rhythm-month-label">${y.label}</span>
                            </div>
                        `}).join("")}
                </div>
            </div>
        `}function _e(){if(console.log("[FinancialMode] Initializing..."),window.Store&&typeof window.Store.getUiSettings=="function"){const c=window.Store.getUiSettings().scenario||{};S={marketMajors:Number(c.marketMajors)||0,burnDelta:Number(c.burnDelta)||0,probFloor:Number.isFinite(Number(c.probFloor))?Number(c.probFloor):50}}ct(),window.addEventListener("mode-changed",c=>{c.detail.mode==="financial"&&pe()}),window.addEventListener("finance:updated",pe),window.addEventListener("resize",()=>{X(document.body.classList.contains("finance-nav-open"))}),document.addEventListener("keydown",c=>{c.key==="Escape"&&be()}),be(),pe()}function ct(){!j.content||j.content.dataset.finUiBound==="1"||(j.content.dataset.finUiBound="1",j.content.addEventListener("click",c=>{const o=c.target.closest("[data-fin-action]");if(!o||!j.content.contains(o))return;const m=String(o.getAttribute("data-fin-action")||"");if(m==="toggle-focus-mode"){const y=!M();y&&window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.saveCurrent=="function"&&window.CoreDashboardLayout.saveCurrent(),F(y),pe();return}if(m==="toggle-collapsible"){const y=String(o.getAttribute("data-fin-section")||"").trim();if(!y)return;$e(y,!fe(y)),pe();return}if(m==="set-tab"){const y=String(o.getAttribute("data-fin-tab")||"").trim();E(y),pe();return}if(m==="set-ledger-view"){const y=String(o.getAttribute("data-fin-ledger-view")||"clean").trim();te(y),pe();return}if(m==="apply-ledger-filters"){x({search:String(document.getElementById("fin-ledger-search")?.value||""),accountId:String(document.getElementById("fin-ledger-account")?.value||"all"),scope:String(document.getElementById("fin-ledger-scope")?.value||"all"),categoryId:String(document.getElementById("fin-ledger-category")?.value||""),type:String(document.getElementById("fin-ledger-type")?.value||"all"),reviewStatus:String(document.getElementById("fin-ledger-review")?.value||"all"),dateFrom:String(document.getElementById("fin-ledger-date-from")?.value||""),dateTo:String(document.getElementById("fin-ledger-date-to")?.value||"")}),pe();return}if(m==="clear-ledger-filters"){B(),pe();return}if(m==="reverse-ledger-transaction"){const y=String(o.getAttribute("data-fin-transaction-id")||"").trim();if(!y)return;typeof window.requestDestructiveConfirmation=="function"&&window.requestDestructiveConfirmation({action:"reverseTransaction",targetId:y,source:"ledger.page.reverse",title:"Reverse transaction",copy:"This reverses the transaction and its linked account balance update.",phrase:"REVERSE TRANSACTION",buttonLabel:"Reverse transaction",renderAfter:!0});return}if(m==="set-scenario-preset"){const y=String(o.getAttribute("data-fin-preset")||"baseline"),V={baseline:{marketMajors:0,burnDelta:0,probFloor:50},conservative:{marketMajors:-15,burnDelta:10,probFloor:35},stretch:{marketMajors:10,burnDelta:-5,probFloor:70}};S=V[y]||V.baseline,window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scenario:S}),pe();return}if(m==="set-invoices-view"){const y=String(o.getAttribute("data-fin-invoices-view")||"open").trim();ve(y),pe();return}m==="toggle-advice"&&(b=!b,pe())}),j.content.addEventListener("change",c=>{const o=c.target;!o||o.id!=="fin-scope-filter"||(window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scopeFilter:String(o.value||"all")}),pe())}))}function pe(){const c=window.Store.getUiSettings().scopeFilter||"all",o=window.Store.computeFinanceContext(!0,c);if(t=o.snapshot,e=o.readModel,d=o.treasury||{},l=o.explanations||{},a=o.diagnostics||{},r=window.Store.getReviewState(),u=Number(e&&e.eventsCount)>0,n=window.FinancialEngine.compute({financeSnapshot:t,financeReadModel:e}),!j.content)return;const m=C(),y=M();ie(m);const V=ut(m);j.content.classList.toggle("fin-focus-mode",m==="dashboard"&&y),j.content.innerHTML=V.join(""),m==="planning"&&(s(),k()),window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.refresh=="function"&&window.CoreDashboardLayout.refresh()}function ut(c){return Li({ledger:f,invoices:Kt,scenarioOutcomes:me,cashCalendar:Xe,pipelineTabs:At,goals:ft,projection:lt,scenarioLab:_,reviewQueue:Ct,obligationReview:St,paymentReview:Je,tensionSignals:ce,weeklyReview:i,reports:Lt,data:$,settings:Ae,reserves:ne,fixedCosts:Me,observatoryHeader:yt,dashboardCockpit:wt,attentionQueue:Nt,next30Days:jt},Ui)(c)}function f(){const c=K(e&&e.transactions).slice().sort((v,Z)=>Date.parse(String(Z&&Z.timestamp||""))-Date.parse(String(v&&v.timestamp||""))),o=P(),m=String(o.search||"").trim().toLowerCase(),y=c.filter(v=>{const Z=window.FinanceDates?.toDateOnly?.(v&&v.timestamp)||String(v&&v.timestamp||"").slice(0,10),le=o.accountId==="all"||String(v&&v.accountId||"")===String(o.accountId)||String(v&&v.fromAccountId||"")===String(o.accountId)||String(v&&v.toAccountId||"")===String(o.accountId),nt=o.scope==="all"||String(v&&v.scope||"shared")===String(o.scope),at=o.type==="all"||String(v&&v.ledgerType||"").toLowerCase()===String(o.type).toLowerCase(),et=o.reviewStatus==="all"||String(v&&v.reviewStatus||"clear")===String(o.reviewStatus),an=!String(o.categoryId||"").trim()||String(v&&v.categoryId||"").toLowerCase().includes(String(o.categoryId).trim().toLowerCase()),oa=(!o.dateFrom||Z>=o.dateFrom)&&(!o.dateTo||Z<=o.dateTo),ra=!m||[v&&v.description,v&&v.accountName,v&&v.fromAccountName,v&&v.toAccountName,v&&v.categoryId,v&&v.source,v&&v.id,v&&v.transactionEntityId].some(sa=>String(sa||"").toLowerCase().includes(m));return le&&nt&&at&&et&&an&&oa&&ra}),V=R(),p=c.filter(v=>String(v&&v.categoryId||"").toLowerCase()==="uncategorized"||String(v&&v.reviewStatus||"").toLowerCase()==="needs_review"),O=c.filter(v=>String(v&&v.type)==="expense.recorded"&&!String(v&&v.obligationId||"").trim()&&String(v&&v.categoryId||"").toLowerCase()==="obligation"),z=c.filter(v=>String(v&&v.type)==="expense.recorded"&&!String(v&&v.receiptUrl||"").trim()&&String(v&&v.categoryId||"").toLowerCase()!=="transfer"),oe=y.reduce((v,Z)=>{const le=Number(Z&&Z.signedAmount);return v+(Number.isFinite(le)?le:Number(Z&&Z.amount)||0)},0),we=v=>{const Z=Se(v&&(v.id||v.transactionEntityId)||""),le=String(v&&v.type)==="expense.recorded",nt=!!String(v&&v.obligationId||"").trim();return`
                <div class="fin-ledger-actions">
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${Z}'">Categorize</button>
                    ${le&&!nt?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${Z}'">Match</button>`:""}
                    <button class="fin-mini-btn" type="button" data-fin-action="reverse-ledger-transaction" data-fin-transaction-id="${Z}">Reverse</button>
                </div>
            `},T=y.map(v=>{const Z=Number(v&&v.signedAmount),le=Number.isFinite(Z)?Z:Number(v&&v.amount)||0,nt=[String(v&&v.categoryId||"").toLowerCase()==="uncategorized"?"Needs category":"",String(v&&v.reviewStatus||"").toLowerCase()==="reviewed"?"Reviewed":"",String(v&&v.obligationId||"").trim()?"Matched":"",String(v&&v.type)==="expense.recorded"?"Tax check":""].filter(Boolean);return`
                <div class="fin-transaction-row">
                    <div>
                        <strong>${L(v.description||"Transaction")}</strong>
                        <small>${ze(v.timestamp)} · ${L(v.categoryId||"uncategorized")} · ${L(v.accountName||v.fromAccountName||"Account")} · ${L(v.scope||"shared")}</small>
                        <div class="fin-chip-row">${nt.map(at=>`<span class="fin-status-pill">${L(at)}</span>`).join("")}</div>
                    </div>
                    <span class="${le>=0?"fin-val-pos":"fin-val-neg"}">${le>=0?"+":"-"}${q(Math.abs(le),v.currency)}</span>
                </div>
            `}).join(""),re=`
            <div class="fin-ledger-toolbar" aria-label="Ledger filters">
                <div class="fin-ledger-filter-grid">
                    <input id="fin-ledger-search" aria-label="Search ledger" value="${L(o.search)}" placeholder="Search note, account, category, source" />
                    <select id="fin-ledger-account" aria-label="Filter ledger by account">${Y(o.accountId)}</select>
                    <select id="fin-ledger-scope" aria-label="Filter ledger by scope">${Gn(o.scope)}</select>
                    <input id="fin-ledger-category" aria-label="Filter ledger by category" value="${L(o.categoryId)}" placeholder="Category" />
                    <select id="fin-ledger-type" aria-label="Filter ledger by type">
                        <option value="all"${o.type==="all"?" selected":""}>All types</option>
                        <option value="income"${o.type==="income"?" selected":""}>Income</option>
                        <option value="expense"${o.type==="expense"?" selected":""}>Expense</option>
                        <option value="transfer"${o.type==="transfer"?" selected":""}>Transfer</option>
                        <option value="adjustment"${o.type==="adjustment"?" selected":""}>Adjustment</option>
                    </select>
                    <select id="fin-ledger-review" aria-label="Filter ledger by review status">
                        <option value="all"${o.reviewStatus==="all"?" selected":""}>All review states</option>
                        <option value="clear"${o.reviewStatus==="clear"?" selected":""}>Clear</option>
                        <option value="needs_review"${o.reviewStatus==="needs_review"?" selected":""}>Needs review</option>
                        <option value="reviewed"${o.reviewStatus==="reviewed"?" selected":""}>Reviewed</option>
                    </select>
                    <input id="fin-ledger-date-from" aria-label="Ledger date from" type="date" value="${L(o.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Ledger date to" type="date" value="${L(o.dateTo)}" />
                </div>
                <div class="fin-action-row fin-action-row--inline">
                    <button class="fin-action-btn" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                    <button class="fin-action-btn" type="button" data-fin-action="clear-ledger-filters">Clear filters</button>
                </div>
            </div>
        `;let U="";return V==="audit"?U=y.length?`
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Date</th><th>Type</th><th>ID / source</th><th>Account</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                        ${y.map(v=>{const Z=Number(v&&v.signedAmount),le=Number.isFinite(Z)?Z:Number(v&&v.amount)||0;return`
                                <tr>
                                    <td>${ze(v.timestamp)}</td>
                                    <td>${L(v.type||v.ledgerType||"transaction")}</td>
                                    <td>${L(v.id||v.transactionEntityId||"")}<small>${L(v.source||v.reviewStatus||"local ledger")}</small></td>
                                    <td>${L(v.accountName||v.fromAccountName||v.toAccountName||"Account")}</td>
                                    <td style="text-align:right" class="${le>=0?"fin-val-pos":"fin-val-neg"}">${le>=0?"+":"-"}${q(Math.abs(le),v.currency)}</td>
                                    <td style="text-align:right">${we(v)}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            `:Ie("Audit log is clean."):V==="work"?U=`
                <div class="fin-status-grid">
                    <div class="fin-status-card"><span>Needs category</span><strong>${p.length}</strong><span>Transactions to classify</span></div>
                    <div class="fin-status-card"><span>Unmatched payments</span><strong>${O.length}</strong><span>Obligation payments to connect</span></div>
                    <div class="fin-status-card"><span>Missing receipt check</span><strong>${z.length}</strong><span>Expense records to review</span></div>
                    <div class="fin-status-card"><span>Filtered records</span><strong>${y.length}</strong><span>${c.length} total movements</span></div>
                </div>
                ${y.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Review</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${y.map(v=>{const Z=Number(v&&v.signedAmount),le=Number.isFinite(Z)?Z:Number(v&&v.amount)||0;return`
                                <tr>
                                    <td>${ze(v.timestamp)}</td>
                                    <td>${L(v.description||"Transaction")}</td>
                                    <td>${L(v.categoryId||"uncategorized")}</td>
                                    <td>${L(v.reviewStatus||"clear")}</td>
                                    <td style="text-align:right" class="${le>=0?"fin-val-pos":"fin-val-neg"}">${le>=0?"+":"-"}${q(Math.abs(le),v.currency)}</td>
                                    <td style="text-align:right">${we(v)}</td>
                                </tr>
                            `}).join("")}
                        </tbody>
                    </table>
                `:Ie("Begin tracking. Add your first payment.")}
            `:U=y.length?T:Ie("Begin tracking. Add your first payment or sync a CSV."),`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Transactions</div>
                            <div class="fin-helper-text">A full page ledger workspace: scan daily movement, classify work items, and inspect raw local evidence without opening a mega-modal.</div>
                        </div>
                        <div class="fin-action-row">
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'">Add transaction</button>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-mini-btn" type="button" data-action="exportTransactionsCsv">Export CSV</button>
                        </div>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card"><span>Total records</span><strong>${c.length}</strong><span>Active local ledger entries</span></div>
                        <div class="fin-status-card"><span>Filtered movement</span><strong class="${oe>=0?"fin-val-pos":"fin-val-neg"}">${oe>=0?"+":"-"}${q(Math.abs(oe))}</strong><span>Current filter result</span></div>
                        <div class="fin-status-card"><span>Needs review</span><strong>${p.length}</strong><span>Category or review work</span></div>
                        <div class="fin-status-card"><span>Matched payments</span><strong>${c.filter(v=>String(v&&v.obligationId||"").trim()).length}</strong><span>Linked to obligations</span></div>
                    </div>
                    ${re}
                    <div class="fin-tabs" role="tablist" aria-label="Transaction view modes">
                        <button class="fin-tab-btn ${V==="clean"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Clean View</button>
                        <button class="fin-tab-btn ${V==="work"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Work View</button>
                        <button class="fin-tab-btn ${V==="audit"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="audit">Audit View</button>
                    </div>
                    <div class="fin-tab-panel">
                        ${U}
                    </div>
                </div>
            </section>
        `}function i(){const c=Fe();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-review-prompt">
                    <div>
                        <div class="widget-title ui-title">${c?"Monthly review due":"Monthly review current"}</div>
                        <div class="fin-helper-text">Reconcile cash accounts, inspect pipeline and recurring costs, then leave one operating note.</div>
                        <div class="fin-operating-meta">Last reviewed ${ze(r&&r.lastReviewedAt)}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${c?"Start review":"Open review"}</button>
                </div>
            </section>
        `}function $(){const c=window.Store&&typeof window.Store.getImportState=="function"?K(window.Store.getImportState().batches).slice(-1)[0]:null,o=window.Store&&typeof window.Store.getLocalDataHealth=="function"?window.Store.getLocalDataHealth():{ok:!0,issues:[],eventCount:0,latestEventAt:null,storageStatus:"healthy",schemaLabel:"unknown",lastBackupAt:null,privateModeWarning:!1,migrationStatus:"current"},m=String(o.storageStatus||"healthy"),y=m==="unavailable"?"Unavailable":m==="limited"?"Limited":"Healthy",V=o.lastBackupAt?ze(o.lastBackupAt):"Never";return`
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Imports and Backups</div>
                        <div class="fin-helper-text">Everything stays local. Use exports before big changes or device moves.</div>
                        ${c?`
                            <div class="modal-list-row">
                                <span><strong>Latest CSV batch</strong><br><small>${L(c.sourceFile)} · ${c.fingerprints.length} rows · ${ze(c.importedAt)}</small></span>
                                <button class="fin-mini-btn" type="button" data-action="undoImportBatch" data-action-args="'${Se(c.id)}'">Undo</button>
                            </div>
                        `:Ie("No local imports found. Bring in your bank statements (CSV).")}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'csvImport'">Import CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportTransactionsCsv">Export transactions CSV</button>
                            <button class="fin-action-btn" type="button" data-action="exportFinanceBackup">Export backup</button>
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'backupRestore'">Restore backup</button>
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Local Data Health</div>
                        <div class="fin-helper-text">${o.ok?"Local finance data is readable and backup-ready.":"Some local Finance Master data needs attention."}</div>
                        <div class="modal-list-row">
                            <span><strong>${o.ok?"Healthy":"Needs attention"}</strong><br><small>${Number(o.eventCount||0)} finance events${o.latestEventAt?` · latest ${ze(o.latestEventAt)}`:""}</small></span>
                            <span>${o.issues.length} issue${o.issues.length===1?"":"s"}</span>
                        </div>
                        <div class="backup-preview-card">
                            <div><span>Storage</span><strong>${y}</strong></div>
                            <div><span>Last backup</span><strong>${V}</strong></div>
                            <div><span>Schema</span><strong>${L(o.schemaLabel||"unknown")}</strong></div>
                            <div><span>Migration</span><strong>${L(o.migrationStatus||"current")}</strong></div>
                        </div>
                        ${o.privateModeWarning?`
                            <div class="fin-compact-empty">Your browser may not keep local data permanently in this mode. Export a backup before closing this window.</div>
                        `:""}
                        ${o.issues.length?`
                            <div class="fin-compact-empty">${o.issues.map(p=>`${L(p.label)}: ${L(p.message)}`).join("<br>")}</div>
                        `:""}
                        <div class="fin-action-row">
                            <button class="fin-action-btn" type="button" data-action="openEditModal" data-action-args="'backupRestore'">Restore backup</button>
                            <button class="btn-danger ui-btn" type="button" data-action="resetLocalFinanceData">Reset local data</button>
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Sample Data</div>
                        <div class="fin-helper-text">Use the fictional sample ledger to understand the cockpit, or clear it for your own records.</div>
                        <div class="settings-reset-actions">
                            <button class="ui-btn ui-btn--secondary" type="button" data-action="resetDemoData">Restore sample data</button>
                            <button class="btn-danger ui-btn" type="button" data-action="deleteDemoData">Delete sample data</button>
                        </div>
                    </div>
                </div>
            </section>
        `}function ne(){const c=K(e?.fiatAccounts).filter(y=>!y.bucket||y.bucket==="available"),o=K(e?.reserveBuckets),m=he("trulyAvailableCash",he("totalCash",Number(t?.realBalance)||0)-he("reservedCash",Number(t?.reservedCash)||0));return`
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Operating Cash</div>
                        <div class="fin-helper-text">Liquid funds spread across your real-world accounts.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount'">Add cash account</button>
                </div>
                ${c.length?c.map(y=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${L(y.name)}</strong>
                            <div class="fin-list-item-sub">${L(y.scope||"shared")}</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${q(y.balance)}</div>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount', '${L(y.id)}'">Edit</button>
                        </div>
                    </div>
                `).join(""):Ie("Establish your treasury. Add your primary operating account.")}
                
                <div class="widget ui-card glass fin-card" style="margin-top: 1rem; padding: 1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size: 0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary);">Truly Available Cash</div>
                            <div style="font-size: 2rem; font-family:var(--font-mono); font-weight:600; margin-top:0.25rem;">${q(m)}</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'allocateReserves'">Allocate cash</button>
                    </div>
                </div>

                <div class="fin-section-heading-row" style="margin-top: 2rem;">
                    <div>
                        <div class="widget-title ui-title">Reserve Buckets</div>
                        <div class="fin-helper-text">Money assigned a job: taxes, VAT, health insurance, and buffer.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket'">Add reserve bucket</button>
                </div>
                ${o.length?o.map(y=>{const V=y.targetAmount>0?Math.min(100,Math.round(y.currentAmount/y.targetAmount*100)):100;return`
                    <div class="widget ui-card glass fin-card fin-list-item" style="flex-direction:column; align-items:stretch; gap:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="fin-list-item-main">
                                <strong>${L(y.name)}</strong>
                                <div class="fin-list-item-sub">${L(y.purpose||"Reserve").replace("_"," ")}</div>
                            </div>
                            <div class="fin-list-item-actions">
                                <div class="fin-list-item-val">${q(y.currentAmount)} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">of ${q(y.targetAmount)}</span></div>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket', '${L(y.id)}'">Edit</button>
                            </div>
                        </div>
                        <div class="fin-stacked-bar" style="height: 8px;">
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${V}%; background:var(--interactive-primary);"></div>
                        </div>
                    </div>
                `}).join(""):Ie("Protect your runway. Create your first reserve bucket (e.g., Taxes).")}
            </section>
        `}function Me(){const c=K(e?.recurringExpenses),o=K(e?.debtAccounts),m={};try{const T=localStorage.getItem("finance-master.ui.expenseOrder");T&&JSON.parse(T).forEach((U,v)=>m[U]=v)}catch{}c.sort((T,re)=>{const U=m.hasOwnProperty(T.id)?m[T.id]:99999,v=m.hasOwnProperty(re.id)?m[re.id]:99999;return U-v});const y=c.reduce((T,re)=>T+(Number(re.monthlyAmount)||0),0),V=c.filter(T=>T.essential),p=c.filter(T=>!T.essential),O=V.reduce((T,re)=>T+(Number(re.monthlyAmount)||0),0),z=p.reduce((T,re)=>T+(Number(re.monthlyAmount)||0),0),oe=o.reduce((T,re)=>T+(Number(re.outstanding)||0),0),we=o.reduce((T,re)=>T+(Number(re.minimumPayment)||0),0);return`
            <section class="fin-section">
                <!-- Summary KPIs -->
                <div class="fin-snapshot-grid fin-snapshot-grid--cockpit">
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Monthly burn</div>
                        <div class="fin-tile-value">${q(y)}</div>
                        <div class="fin-tile-subline">${rn(c.length,"recurring cost")}</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Essential</div>
                        <div class="fin-tile-value">${q(O)}</div>
                        <div class="fin-tile-subline">${rn(V.length,"item")} · cannot cut</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Flexible</div>
                        <div class="fin-tile-value">${q(z)}</div>
                        <div class="fin-tile-subline">${rn(p.length,"item")} · can reduce</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Total debt</div>
                        <div class="fin-tile-value fin-text-med">${q(oe)}</div>
                        <div class="fin-tile-subline">${rn(o.length,"liability","liabilities")}</div>
                    </div>
                </div>
            </section>

            <!-- Essential Costs -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Essential Costs</div>
                        <div class="fin-helper-text">Non-negotiable monthly obligations. These define your survival burn rate.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                </div>
                ${V.length?V.map((T,re)=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${L(T.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${L(String(T.dueDay))} · ${L(T.scope||"shared")} · Essential</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${q(T.monthlyAmount)} / mo</div>
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${Se(T.id)}', '-1'" ${re===0?'disabled style="opacity:0.3"':""}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${Se(T.id)}', '1'" ${re===V.length-1?'disabled style="opacity:0.3"':""}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${Se(T.id)}'">Edit</button>
                            </div>
                        </div>
                    </div>
                `).join(""):Ie("Define your survival burn. What fixed costs keep the business alive?")}
            </section>

            <!-- Flexible Costs -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Flexible Costs</div>
                        <div class="fin-helper-text">Subscriptions and discretionary spend. These are your first candidates for cutting.</div>
                    </div>
                </div>
                ${p.length?p.map((T,re)=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${L(T.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${L(String(T.dueDay))} · ${L(T.scope||"shared")} · Flex</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${q(T.monthlyAmount)} / mo</div>
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${Se(T.id)}', '-1'" ${re===0?'disabled style="opacity:0.3"':""}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${Se(T.id)}', '1'" ${re===p.length-1?'disabled style="opacity:0.3"':""}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${Se(T.id)}'">Edit</button>
                            </div>
                        </div>
                    </div>
                `).join(""):Ie("Define your comfort burn. What costs are nice-to-have?")}
            </section>

            <!-- Debt Items -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Debt & Liabilities</div>
                        <div class="fin-helper-text">Credit lines, loans, and other negative balances.${we>0?` Combined minimum payments: ${q(we)} / mo.`:""}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt item</button>
                </div>
                ${o.length?o.map(T=>{const re=T.planType==="custom"&&T.installments?.length>0||(Number(T.minimumPayment)||0)>0||String(T.paymentPlanNote||"").trim(),U=T.totalAdded>0?Math.min(100,Math.round((T.totalPaid||0)/T.totalAdded*100)):0;return`
                    <div class="widget ui-card glass fin-card fin-debt-card">
                        <div class="fin-debt-header">
                            <div class="fin-list-item-main">
                                <strong>${L(T.name)}</strong>
                                <div class="fin-list-item-sub">${L(T.scope||"shared")}${T.dueDate?` · Due ${ze(T.dueDate)}`:""}</div>
                            </div>
                            <div class="fin-list-item-actions" style="flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                                <div style="display:flex; gap:0.25rem; justify-content: flex-end;">
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPayment', '${Se(T.id)}'" title="Record payment">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPlan', '${Se(T.id)}'" title="Update plan">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd', '${Se(T.id)}'" title="Edit account">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
                                </div>
                                <div class="fin-list-item-val fin-text-med">${q(T.outstanding)}</div>
                            </div>
                        </div>
                        ${T.totalAdded>0?`
                        <div class="fin-debt-progress">
                            <div class="fin-debt-bar-track">
                                <div class="fin-debt-bar-fill" style="width: ${U}%"></div>
                            </div>
                            <div class="fin-debt-bar-label">${q(T.totalPaid||0)} paid of ${q(T.totalAdded)} · ${U}%</div>
                        </div>
                        `:""}
                        <div class="fin-debt-details">
                            ${T.planType==="custom"?`<span>Custom Plan: ${T.installments?.length||0} installments</span>`:(Number(T.minimumPayment)||0)>0?`<span>${(T.frequency||"monthly").charAt(0).toUpperCase()+(T.frequency||"monthly").slice(1)} payment: ${q(T.minimumPayment)}</span>`:""}
                            ${String(T.paymentPlanNote||"").trim()?`<span>Plan note: ${L(T.paymentPlanNote)}</span>`:""}
                            ${re?"":'<span style="color: var(--negative, #ff4b4b); font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Missing payment plan</span>'}
                        </div>
                    </div>
                `}).join(""):Ie("Debt-free operations.")}
            </section>
        `}function Ae(){const c=window.Store.getFinanceSettings(),o=window.Store.getUiSettings();return`
            <section class="fin-section">
                <!-- System Preferences -->
                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">System Preferences</div>
                    <div class="fin-settings-form">
                        <div class="form-group">
                            <label for="page-settings-currency">Base currency</label>
                            <input id="page-settings-currency" value="${L(c.baseCurrency||"EUR")}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-forecast">Forecast horizon (days)</label>
                            <input id="page-settings-forecast" type="number" value="${L(c.forecastDays||90)}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-scope">Default scope filter</label>
                            <select id="page-settings-scope">
                                <option value="all"${o.scopeFilter==="all"?" selected":""}>All scopes</option>
                                <option value="business"${o.scopeFilter==="business"?" selected":""}>Business only</option>
                                <option value="personal"${o.scopeFilter==="personal"?" selected":""}>Personal only</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="page-settings-appearance">Appearance</label>
                            <select id="page-settings-appearance">
                                <option value="bright"${o.appearance==="bright"?" selected":""}>Bright (Default)</option>
                                <option value="aurora"${o.appearance==="aurora"?" selected":""}>Aurora (Dark)</option>
                                <option value="midnight"${o.appearance==="midnight"?" selected":""}>Midnight (OLED)</option>
                                <option value="twilight"${o.appearance==="twilight"?" selected":""}>Twilight (Deep Blue)</option>
                                <option value="system"${o.appearance==="system"?" selected":""}>Follow System</option>
                            </select>
                        </div>
                        <label class="settings-check">
                            <input id="page-settings-reduced-motion" type="checkbox"${o.reducedMotion?" checked":""} />
                            <span>Reduced motion</span>
                        </label>
                        <div class="fin-settings-actions">
                            <button class="ui-btn ui-btn--primary" type="button" data-action="FinancialMode.saveSettingsPage">Apply preferences</button>
                        </div>
                    </div>
                </div>

                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">System boundaries</div>
                    <div class="fin-helper-text">
                        Finance Master stays local-first. Backup, restore, CSV import, sample data, and reset controls live in Import & Backup.
                    </div>
                    <div class="fin-settings-actions">
                        <button class="ui-btn ui-btn--secondary" type="button" data-action="FinancialMode.setSection" data-action-args="'data'">Open Import & Backup</button>
                    </div>
                    <div class="fin-integrations-grid">
                        <div class="fin-integration-item">
                            <strong>Market Portfolio</strong>
                            <span>Postponed. Live quotes do not serve daily cashflow.</span>
                        </div>
                        <div class="fin-integration-item">
                            <strong>Web3 / DeFi</strong>
                            <span>Postponed. Outside the core operating loop.</span>
                        </div>
                    </div>
                </div>
            </section>
        `}function xe(c){return K(d&&d[c])}function he(c,o=0){const m=Number(d&&d[c]);return Number.isFinite(m)?m:o}function mt(c){return c==="subtract"?"Subtract":c==="divide"?"Divide by":c==="multiply"?"Multiply by":"Add"}function pt(c,o){const m=String(c&&c.key||""),y=Number(o)||0;return m==="runway"?`${y.toFixed(1)} months`:m==="forecastConfidence"?`${Math.round(y)}%`:q(y)}function Pe(c){const o=l&&l[c];return!o||!Array.isArray(o.parts)?"":`
            <details class="fin-metric-explainer" data-fin-explainer="${L(c)}">
                <summary>How calculated</summary>
                <div class="fin-confidence-list">
                    ${o.parts.map(m=>`
                        <div class="fin-confidence-row">
                            <span class="fin-muted">${mt(m.operation)} ${L(m.label)}</span>
                            <strong>${pt(o,m.value)}</strong>
                        </div>
                    `).join("")}
                    ${K(o.warnings).map(m=>`
                        <div class="fin-confidence-row">
                            <span class="fin-text-med">${L(m)}</span>
                        </div>
                    `).join("")}
                </div>
            </details>
        `}function Ne(c){const o=String(c&&(c.status||c.stage)||"").toLowerCase(),m=Number(c&&c.probability),y=window.FinanceDates?.toDateOnly?.(c&&c.expectedDateISO)||String(c&&c.expectedDateISO||"").slice(0,10),V=window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10);return o==="paid"||o==="received"?"paid":y&&y<V?"overdue":o==="confirmed"||m>=.8?"confirmed":o==="risky"||m<.5?"uncertain":"likely"}function Kt(){const c=de(),o=We().map(p=>({id:String(p&&p.id||""),title:String(p&&p.title||"Expected income"),amount:Number(p&&p.value)||0,probability:Number(p&&p.probability)||0,expectedDateISO:p&&p.expectedDateISO,settlementAccount:String(p&&p.destinationAccountName||p&&p.destinationAccountId||""),status:Ne(p)})),m=K(e&&e.invoices).filter(p=>String(p&&p.status||"").toLowerCase()==="paid").slice(0,8).map(p=>({id:String(p&&p.id||""),title:String(p&&(p.client||p.title)||"Paid income"),amount:Number(p&&p.amount)||0,probability:1,expectedDateISO:p&&(p.paidAt||p.sentAt),settlementAccount:String(p&&p.destinationAccountName||""),status:"paid"}));let y=[];c==="open"?y=o.sort((p,O)=>(Date.parse(p.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)-(Date.parse(O.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)):c==="settled"?y=m.sort((p,O)=>(Date.parse(O.expectedDateISO||"")||0)-(Date.parse(p.expectedDateISO||"")||0)):y=o.concat(m).sort((p,O)=>(Date.parse(O.expectedDateISO||"")||0)-(Date.parse(p.expectedDateISO||"")||0));const V=o.reduce((p,O)=>(p[O.status]=(p[O.status]||0)+O.amount,p),{});return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income & Invoices</div>
                            <div class="fin-helper-text">Invoices here are expected income records. Settlement turns them into real account cash.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add invoice</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${$t("confirmed")}<strong>${q(V.confirmed||0)}</strong><span>Signed or high-confidence income</span></div>
                        <div class="fin-status-card">${$t("likely")}<strong>${q(V.likely||0)}</strong><span>Expected but not guaranteed</span></div>
                        <div class="fin-status-card">${$t("uncertain")}<strong>${q(V.uncertain||0)}</strong><span>Lower-confidence assumptions</span></div>
                        <div class="fin-status-card">${$t("overdue")}<strong>${q(V.overdue||0)}</strong><span>Follow-up candidates</span></div>
                    </div>
                    
                    <div class="fin-tabs" role="tablist" aria-label="Invoice view modes">
                        <button class="fin-tab-btn ${c==="open"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="open">Open Income</button>
                        <button class="fin-tab-btn ${c==="settled"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="settled">Settled</button>
                        <button class="fin-tab-btn ${c==="all"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="all">All</button>
                    </div>

                    <div class="fin-table-wrap" style="margin-top: 1rem;">
                        ${y.length?`
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Expected / paid</th><th>Confidence</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${y.map(p=>`
                                        <tr>
                                            <td>${L(p.title)}${p.settlementAccount?`<small>${L(p.settlementAccount)}</small>`:""}</td>
                                            <td>${$t(p.status)}</td>
                                            <td>${p.expectedDateISO?ze(p.expectedDateISO):"No date"}</td>
                                            <td>${Math.round(p.probability*100)}%</td>
                                            <td style="text-align:right">${q(p.amount)}</td>
                                            <td style="text-align:right">
                                                ${p.status==="paid"?"":`
                                                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income', '${Se(p.id)}'">Edit</button>
                                                    <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${Se(p.id)}'">Received</button>
                                                `}
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        `:Ie("Forecast future income. What is the next expected payment?")}
                    </div>
                </div>
            </section>
        `}function Lt(){const c=Ye(),o=he("totalCash",Number(t&&t.realBalance)||0),m=he("reservedCash",Number(t&&t.reservedCash)||0),y=he("trulyAvailableCash",o-m),V=o>0?Math.round(m/o*100):0,p=tt(),O={};let z=0;K(e?.invoices).concat(K(e?.pipelineDeals)).forEach(U=>{const v=String(U.client||U.title||"Unknown").trim(),Z=Number(U.amount||U.value)||0;Z>0&&(O[v]=(O[v]||0)+Z,z+=Z)});const oe=Object.entries(O).sort((U,v)=>v[1]-U[1]).slice(0,4).map(([U,v])=>{const Z=z>0?Math.round(v/z*100):0;return{client:U,amount:v,pct:Z}}),we={};let T=0;K(e?.transactions).forEach(U=>{if(String(U.type)==="expense.recorded"||Number(U.signedAmount||U.amount)<0){const v=String(U.categoryId||"Uncategorized").trim(),Z=Math.abs(Number(U.signedAmount||U.amount)||0);Z>0&&(we[v]=(we[v]||0)+Z,T+=Z)}});const re=Object.entries(we).sort((U,v)=>v[1]-U[1]).slice(0,4).map(([U,v])=>{const Z=T>0?Math.round(v/T*100):0;return{cat:U,amount:v,pct:Z}});return`
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Financial Health</div>
                        <div class="fin-health-status ${p.tone}">
                            <span>Status</span>
                            <strong>${L(p.text)}</strong>
                            <small>${n&&n.stressLevel?`Stress level ${L(n.stressLevel)}`:"Add core inputs for a clearer reading."}</small>
                        </div>
                        <ul class="fin-advice-list">
                            ${Be().slice(0,4).map(U=>`<li>${L(U)}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Reserve Pattern</div>
                        <div class="fin-status-grid">
                            <div class="fin-status-card"><span>Available</span><strong>${q(y)}</strong><span>After reserves</span></div>
                            <div class="fin-status-card"><span>Reserved</span><strong>${q(m)}</strong><span>${V}% of total cash</span></div>
                        </div>
                        ${Qe(c)}
                    </div>
                </div>
            </section>
            
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Client Concentration</div>
                        <div class="fin-helper-text">Reliance on top income sources. High concentration is a vulnerability.</div>
                        <div class="fin-table-wrap" style="margin-top: 1rem;">
                            ${oe.length?`
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${oe.map(U=>`
                                            <tr>
                                                <td style="width: 40%;"><strong>${L(U.client)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${U.pct}%; background: var(--interactive-primary);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${q(U.amount)} <small>(${U.pct}%)</small></td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            `:Ie("No income data available yet.")}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Top Expense Categories</div>
                        <div class="fin-helper-text">Where the money flows over time.</div>
                        <div class="fin-table-wrap" style="margin-top: 1rem;">
                            ${re.length?`
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${re.map(U=>`
                                            <tr>
                                                <td style="width: 40%;"><strong>${L(U.cat)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${U.pct}%; background: var(--negative, #ff4b4b);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${q(U.amount)} <small>(${U.pct}%)</small></td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            `:Ie("No expense data available yet.")}
                        </div>
                    </div>
                </div>
            </section>
        `}function yt(){const c=xe("reviewQueue").length,o=Fe();return`
            <section class="fin-section fin-section--toolbar">
                <div class="fin-ui-toolbar">
                    <div class="fin-operating-meta">
                        <span>Last updated: ${ze(a.latestEventTimestamp)||"Never"}</span>
                        <span>Unreviewed: ${c}</span>
                        ${o?'<span class="fin-text-high">Review due today</span>':""}
                        <span>Data: Local only</span>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${Gn(window.Store.getUiSettings().scopeFilter||"all")}</select>
                    </div>
                </div>
            </section>
        `}function wt(){const c=he("actualCash",he("totalCash",Number(t?.realBalance)||0)),o=he("protectedCash",he("reservedCash",Number(t?.reservedCash)||0)),m=he("availableCash",Number(t?.availableCash)||he("trulyAvailableCash",c-o)),y=he("totalMonthlyBurn",Number(t?.monthlyBurn)||0),V=d?.incomeScenarios||{},p=Number.isFinite(Number(V.expected))?Number(V.expected):Number(t?.projectedBalance)||m,O=d?.runwayMonths!=null?d.runwayMonths:t?.runwayMonths,z=O==null?"—":`${Number(O).toFixed(1)}`,oe=O==null||Number(O)<3?"stress-high":Number(O)<6?"stress-medium":"stress-low",we=O==null?"No data":Number(O)<3?"Vulnerable":Number(O)<6?"Stable":"Safe to operate",T=xe("reserveBuckets").filter(et=>["tax_reserve","vat_reserve","health_insurance","debt_repayment","buffer"].includes(String(et.bucket))).filter(et=>Number(et.amount)>0),re=d?.dashboardSummary?.next30Days||{},U=Number(re.confirmedIncoming)||0,v=Number(re.obligationsDue)||0,Z=c||1,le=Math.max(0,Math.min(100,Math.round(Math.max(0,m)/Z*100))),nt=Math.max(0,Math.min(100-le,Math.round(o/Z*100)));let at="";return p<0?at=`Projected to close ${q(p)}. Action needed.`:at=`On track to close with ${q(p)} surplus.`,`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-cockpit-overview">

                    <!-- Hero: Runway + Burn -->
                    <div class="fin-cockpit-hero">
                        <div class="fin-runway-gauge">
                            <div class="fin-runway-label">Runway</div>
                            <div class="fin-runway-value ${oe}">${z}<span style="font-size: 1.2rem; opacity: 0.6; margin-left: 0.25rem;">${O!=null?"months":""}</span></div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${we}</div>
                            ${Pe("runway")}
                        </div>
                        <div class="fin-cockpit-burn">
                            <div class="fin-burn-label">Monthly burn</div>
                            <div class="fin-burn-value">${u?q(y):"—"}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">Recurring costs</div>
                            ${Pe("monthlyBurnRate")}
                        </div>
                    </div>

                    <hr class="fin-divider">

                    <!-- Cash Breakdown -->
                    <div class="fin-cockpit-cash">
                        <div class="fin-cash-header"><span>Total Cash</span><strong>${u?q(c):"—"}</strong></div>
                        <div class="fin-stacked-bar">
                            <div class="fin-bar-segment fin-bar-available" style="width: ${le}%; transition: width 0.6s ease;"></div>
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${nt}%; transition: width 0.6s ease;"></div>
                        </div>
                        <div class="fin-cash-legend">
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-available"></span>
                                <span class="fin-legend-val">${q(m)}</span>
                                <span class="fin-legend-lbl">Available</span>
                                ${Pe("availableCash")}
                            </div>
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-protected"></span>
                                <span class="fin-legend-val">${q(o)}</span>
                                <span class="fin-legend-lbl">Protected</span>
                                ${Pe("protectedCash")}
                            </div>
                        </div>
                        ${T.length?`
                            <div class="fin-reserve-mini-grid">
                                ${T.map(et=>`
                                    <div style="display:flex; justify-content:space-between; gap: 0.5rem;">
                                        <span>${L(et.label)}</span>
                                        <strong style="font-family: var(--font-mono);">${q(et.amount)}</strong>
                                    </div>
                                `).join("")}
                            </div>
                        `:""}
                    </div>

                    <hr class="fin-divider">

                    <!-- Cashflow Outlook -->
                    <div class="fin-cockpit-cashflow">
                        <div class="fin-cashflow-header">30-Day Outlook</div>
                        <div class="fin-cashflow-grid">
                            <div>
                                <span>Incoming</span>
                                <strong style="color: rgba(168, 230, 207, 0.95);">${q(U)}</strong>
                            </div>
                            <div>
                                <span>Obligations</span>
                                <strong style="color: rgba(241, 185, 167, 0.95);">${q(v)}</strong>
                            </div>
                            <div>
                                <span>Month-end</span>
                                <strong class="${p<0?"fin-val-neg":""}">${u?q(p):"—"}</strong>
                            </div>
                        </div>
                        <div class="fin-cashflow-copy">${at}</div>
                    </div>
                </div>
            </section>
        `}function Nt(){const c=K(t?.attentionQueue),o=Fe(),m=d?.incomeScenarios||{},y=Number.isFinite(Number(m.expected))?Number(m.expected):Number(t?.projectedBalance)||0,V=[...o?[{type:"Monthly review",title:"Review not started",action:"Close month",id:"monthly-review"}]:[],...y<0?[{type:"Due soon",title:`Month-end gap: ${q(Math.abs(y))}`,action:"Adjust reserves",id:"month-end-gap"}]:[],...c].slice(0,10);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Attention Queue</div>
                            <div class="fin-helper-text">Unresolved items, overdue payments, and missing plans.</div>
                        </div>
                    </div>
                    ${V.length?'<ul class="fin-decision-list" style="gap:0.75rem;">'+V.map(p=>`
                        <li>
                            <div class="fin-decision-header">
                                <div>
                                    <strong>${L(p.title)} ${p.amount!=null?q(p.amount):""}</strong>
                                    <div class="fin-decision-reason" style="text-transform:uppercase; font-size:0.7rem; font-family:var(--font-mono);">${L(p.type)}</div>
                                </div>
                            </div>
                            <div class="fin-decision-actions">
                                <button class="fin-mini-btn" type="button" data-action="${p.id==="monthly-review"?"openEditModal":"FinancialMode.setSection"}" data-action-args="${p.id==="monthly-review"?"'weeklyReview'":"'review'"}">${L(p.action||"Resolve item")}</button>
                            </div>
                        </li>
                    `).join("")+"</ul>":Ie("Attention queue is clear. Smooth sailing.")}
                </div>
            </section>
        `}function jt(){const c=d?.dashboardSummary?.next30Days||{},o=We(),m=o.filter(p=>(p.probability||0)>=.8).reduce((p,O)=>p+(Number(O.value)||0),0),y=o.filter(p=>(p.probability||0)>=.5&&(p.probability||0)<.8).reduce((p,O)=>p+(Number(O.value)||0),0),V=o.filter(p=>(p.probability||0)<.5).reduce((p,O)=>p+(Number(O.value)||0),0);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Forecast Confidence</div>
                        </div>
                    </div>
                    <div class="fin-confidence-list">
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Expected weighted</span>
                            <strong class="fin-text-primary">${q(c.expectedWeightedIncoming)}</strong>
                        </div>
                        <div class="fin-divider-line"></div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Confirmed</span>
                            <strong class="fin-text-safe">${q(m)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Likely</span>
                            <strong class="fin-text-med">${q(y)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Unconfirmed</span>
                            <strong class="fin-text-high">${q(V)}</strong>
                        </div>
                    </div>
                    ${Pe("forecastConfidence")}
                    <div class="fin-action-row">
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Confirm income</button>
                    </div>
                </div>
            </section>
        `}function Ct(){const c=xe("reviewQueue"),o=Fe();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Review Queue</div>
                            <div class="fin-helper-text">${c.length} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${o?"Start review":"Open review"}</button>
                    </div>
                    ${c.length?c.map(y=>`
                        <div class="modal-list-row">
                            <span><strong>${L(y.title)}</strong><br><small>${L(y.reason)} · ${L(y.kind||"review")}</small></span>
                            <span>${$t(y.tone==="urgent"?"overdue":"needs_review")}</span>
                            <span class="goal-modal-actions">${Jt(y)}</span>
                        </div>
                    `).join(""):Ie("All items reviewed and reconciled.")}
                </div>
            </section>
        `}function Jt(c){const o=String(c&&c.kind||"setup"),m=Se(c&&(c.targetId||c.id)||"");return o==="transaction"?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${m}'">Categorize</button>`:o==="payment"?`
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${m}'">Match</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${m}'">Categorize</button>
            `:o==="pipeline"?`
                <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${m}'">Received</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'pipelineReview', '${m}'">Update</button>
                <button class="fin-mini-btn" type="button" data-action="cancelPipelineFromReview" data-action-args="'${m}'">Cancel</button>
            `:o==="debt"?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'debtPlan', '${m}'">Add plan</button>`:o==="obligation"?`
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${m}'">Mark paid</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${m}'">Defer</button>
                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${m}'">Review</button>
            `:String(c&&c.id)==="missing-cash"?`<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add account</button>`:String(c&&c.id)==="missing-burn"?`<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add cost</button>`:`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${L(c&&c.actionLabel||"Review")}</button>`}function St(){const c=xe("obligations").filter(o=>["overdue","due_soon","needs_review"].includes(String(o&&o.status||""))).slice(0,12);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Expected Obligations</div>
                            <div class="fin-helper-text">Resolve due costs here: pay, defer, or keep them flagged for review.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                    </div>
                    ${c.length?c.map(o=>`
                        <div class="modal-list-row">
                            <span><strong>${L(o.title)}</strong><br><small>${o.dueDate?ze(o.dueDate):"No due date"} · ${L(o.scope||"shared")}</small></span>
                            <span>${$t(o.status)} ${q(o.amount)}</span>
                            <span class="goal-modal-actions">
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${Se(o.id)}'">Mark paid</button>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${Se(o.id)}'">Defer</button>
                                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${Se(o.id)}'">Review</button>
                            </span>
                        </div>
                    `).join(""):Ie("No pressing obligations. You are in the clear.")}
                </div>
            </section>
        `}function Je(){const c=K(e&&e.transactions).filter(o=>String(o&&o.type)==="expense.recorded").slice(0,8);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Actual Payments</div>
                            <div class="fin-helper-text">Payments booked into the ledger. Matched payments are tied to an obligation; the rest are review material.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction'">Add payment</button>
                    </div>
                    ${c.length?c.map(o=>{const m=!!o.obligationId;return`
                        <div class="modal-list-row">
                            <span><strong>${L(o.description||"Payment")}</strong><br><small>${ze(o.timestamp)} · ${L(o.accountName||"Account")} · ${L(o.categoryId||"uncategorized")}</small></span>
                            <span>${$t(m?"paid":"needs_review")} ${q(o.amount,o.currency)}</span>
                            <span class="goal-modal-actions">
                                ${m?"":`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${Se(o.id)}'">Match</button>`}
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${Se(o.id)}'">Categorize</button>
                            </span>
                        </div>
                    `}).join(""):Ie("Awaiting payments. Book transactions to match them against expectations.")}
                </div>
            </section>
        `}function me(){const c=d&&d.incomeScenarios||{};return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="widget-title ui-title">Scenarios</div>
                    <div class="fin-helper-text">Three readable forecasts for the current horizon: conservative, realistic, and optimistic.</div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">
                            <span class="fin-muted">Conservative</span>
                            <strong>${q(c.conservative)}</strong>
                            <span>Confirmed income only</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Realistic</span>
                            <strong>${q(c.expected)}</strong>
                            <span>Confirmed + expected</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Optimistic</span>
                            <strong>${q(c.optimistic)}</strong>
                            <span>Confirmed + expected + risky</span>
                        </div>
                    </div>
                </div>
            </section>
        `}function Fe(){const c=Date.parse(String(r&&r.lastReviewedAt||""));return!Number.isFinite(c)||Date.now()-c>=10080*60*1e3}function je(c=90){const o=new Date;o.setHours(12,0,0,0);const m=new Date(o);m.setDate(m.getDate()+c);const y=[];K(e&&e.recurringExpenses).forEach(p=>{for(let O=0;O<4;O+=1){const z=new Date(o.getFullYear(),o.getMonth()+O,Math.max(1,Math.min(28,Number(p.dueDay)||1)),12);z<o||z>m||y.push({date:z,label:p.category,amount:-(Number(p.monthlyAmount)||0),kind:"Cost"})}}),We().forEach(p=>{const O=new Date(p.expectedDateISO||"");!Number.isFinite(O.getTime())||O<o||O>m||y.push({date:O,label:p.title,amount:(Number(p.value)||0)*(Number(p.probability)||0),kind:"Expected income"})}),y.sort((p,O)=>p.date-O.date);const V=[30,60,90].map(p=>{const O=new Date(o);O.setDate(O.getDate()+p);let z=Number(t&&t.realBalance)||0,oe=z;return y.filter(we=>we.date<=O).forEach(we=>{z+=we.amount,oe=Math.min(oe,z)}),{horizon:p,low:oe}});return{events:y,lows:V}}function Xe(){const c=je();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-calendar-card">
                    <div class="widget-title ui-title">Cash Calendar</div>
                    <div class="fin-helper-text">Upcoming obligations and probability-weighted income. Start with the next material moments.</div>
                    <div class="fin-calendar-lows">
                        ${c.lows.map(o=>`<div><span>${o.horizon}d low</span><strong>${q(o.low)}</strong></div>`).join("")}
                    </div>
                    <div class="fin-calendar-events">
                        ${c.events.length?c.events.slice(0,3).map(o=>`
                            <div class="fin-calendar-event">
                                <span><strong>${o.label}</strong><small>${o.kind} · ${ze(o.date)}</small></span>
                                <span class="${o.amount>=0?"fin-val-pos":"fin-val-neg"}">${o.amount>=0?"+":"-"}${q(Math.abs(o.amount))}</span>
                            </div>
                        `).join(""):Ie("Map out upcoming events to shape your cash calendar.")}
                    </div>
                </div>
            </section>
        `}function ft(){const c=window.Store.getUiSettings().scopeFilter||"all",o=typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(c):[];return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-goals-card">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings and Buffer Goals</div>
                            <div class="fin-helper-text">Live progress from linked cash accounts. Keep the targets few and useful.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'${o.length?"goals":"goal"}'">${o.length?"Manage goals":"Add goal"}</button>
                    </div>
                    ${o.length?`
                        <div class="fin-goals-grid">
                            ${o.map(m=>`
                                <div class="fin-goal-item">
                                    <div class="fin-goal-meta">
                                        <span><strong>${L(m.name)}</strong><small>${L(m.type)} · ${L(m.scope)}${m.targetDate?" · by "+ze(m.targetDate):""}</small></span>
                                        <span>${Math.round(m.progressPercent)}%</span>
                                    </div>
                                    <div class="fin-goal-track"><span style="width:${m.progressPercent}%"></span></div>
                                    <div class="fin-goal-values"><span>${q(m.currentAmount)}</span><span>of ${q(m.targetAmount)}</span></div>
                                </div>
                            `).join("")}
                        </div>
                    `:Ie("Set a safety buffer to build peace of mind.")}
                </div>
            </section>
        `}function At(){const c=We(),o=K(e&&e.invoices).filter(z=>String(z&&z.status||"").toLowerCase()==="paid").sort((z,oe)=>new Date(oe.paidAt||oe.sentAt||0)-new Date(z.paidAt||z.sentAt||0)),m=c.reduce((z,oe)=>z+(Number(oe.value)||0)*(Number(oe.probability)||0),0),y=c.map(z=>({title:z.title||"Pipeline item",weighted:(Number(z.value)||0)*(Number(z.probability)||0)})).sort((z,oe)=>oe.weighted-z.weighted).slice(0,4),V=Ye(),p=W();let O="";return p==="history"?O=o.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Paid date</th><th>Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${o.map(z=>`
                                <tr>
                                    <td>${z.client||"Invoice"}</td>
                                    <td>${new Date(z.paidAt||z.sentAt||Date.now()).toLocaleDateString()}</td>
                                    <td>${q(z.amount)}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${Se(z.id)}'" title="Remove from history">×</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `:Ie("No settled income yet."):p==="cashflow"?O=Qe(V):O=`
                ${c.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Expected date</th><th>Amount</th><th>Prob.</th><th>Weighted</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${c.map(z=>`
                                <tr>
                                    <td>${z.title||"Pipeline item"}</td>
                                    <td>${z.expectedDateISO}</td>
                                    <td>${q(z.value)}</td>
                                    <td>${(Number(z.probability||0)*100).toFixed(0)}%</td>
                                    <td class="fin-val-pos">${q((Number(z.value)||0)*(Number(z.probability)||0))}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'income', '${Se(z.id)}'" title="Edit">${ye("edit",{size:"xs",tone:"muted"})}</button>
                                        <button class="fin-mini-btn" data-action="markAsPaid" data-action-args="'${Se(z.id)}'" title="Mark as paid">${ye("success",{size:"xs",tone:"success"})}</button>
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${Se(z.id)}'" title="Archive">×</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `:Ie(u?"Forecast future income. What is the next likely incoming payment?":"Begin tracking. Add your first entry.")}
                ${c.length&&y.length?`
                    <div class="fin-tab-subsection">
                        <div class="fin-muted fin-subtitle">Dependencies</div>
                        ${y.map(z=>{const oe=m>0?Math.round(z.weighted/m*100):0;return`<div class="fin-row-inline"><span>${z.title}</span><span class="fin-muted">${oe}%</span></div>`}).join("")}
                    </div>
                `:""}
                <button class="fin-action-btn" data-action="FinancialMode.openAddModal" data-action-args="'income'">+ Add pipeline item</button>
            `,`
	            <section class="fin-section">
	                <div class="widget ui-card glass fin-card">
	                    <div class="drag-handle">⋮⋮</div>
	                    <div class="widget-title ui-title">Pipeline</div>
	                    <div class="fin-tabs" role="tablist" aria-label="Pipeline tabs">
	                        <button class="fin-tab-btn ${p==="pipeline"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="pipeline">Pipeline</button>
	                        <button class="fin-tab-btn ${p==="history"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="history">History</button>
	                        <button class="fin-tab-btn ${p==="cashflow"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="cashflow">Cashflow</button>
	                    </div>
                    <div class="fin-tab-panel">
                        ${O}
                    </div>
                </div>
            </section>
        `}function lt(){return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-projection-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Projection (12‑month runway)</div>
                    <div id="fin-projection-chart" class="fin-chart-container fin-chart-container--subtle">
                        <svg id="fin-projection-svg" width="100%" height="100%" viewBox="0 0 960 280" preserveAspectRatio="none"></svg>
                    </div>
                    <div class="fin-chart-legend">
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--safe"></span>Safe</div>
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--realistic"></span>Realistic</div>
                        <div class="fin-chart-pill"><span class="fin-chart-dot fin-chart-dot--optimistic"></span>Optimistic</div>
                    </div>
                </div>
            </section>
        `}function Be(){const c=[],o=Number(t&&t.runwayMonths),m=Number.isFinite(o),y=K(t&&t.missingInputs),V=Number(t&&t.totalDebt)||0,p=Number(t&&t.realBalance)||0,O=Number(t&&t.confidenceScore);return m?o<2?c.push("Runway is very thin. Consider protecting liquidity and easing optional spend."):o<4?c.push("Runway is thin. It may help to secure one near‑term paid commitment."):c.push("Runway looks steady. Keep it simple."):c.push("Runway becomes clearer once recurring expenses are noted."),V>Math.max(1,p)&&c.push("Debt is high compared to cash on hand. A weekly check-in may help."),y.length>0&&c.push(`Missing: ${y.slice(0,2).join(", ")}.`),Number.isFinite(O)&&O<.5&&c.push("Confidence is thin. Add one recent income or expense to sharpen the picture."),c.length===0&&c.push("Nothing pressing right now. Keep reconciling as you go."),c}function Ue(){const c=Number(S.burnDelta||0),o=Number(S.marketMajors||0),m=Number(S.probFloor||50);return`Scenario: burn ${c>=0?"+":""}${c}%, market ${o>=0?"+":""}${o}%, probability floor ${m}%.`}function _(){const c=Be(),o=b?c:c.slice(0,2),m=c.length>2;return`
            <section class="fin-section">
                <div class="fin-lab-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Simulator Lab</div>
                        <div class="fin-helper-text">Stress-test your runway with freelancer-specific scenarios.</div>
                        
                        <div class="fin-slider-group" style="margin-top: 1rem;">
                            <label class="settings-check">
                                <input type="checkbox" id="fin-lab-client" ${S.loseClient?"checked":""} />
                                <span>Lose biggest client</span>
                            </label>
                            ${Ze("Delay payments by","delay",S.delayPayments||0,0,90," days")}
                            ${Ze("Tax rate hike","tax",S.taxHike||0,0,20,"%")}
                            <hr style="border-top: 1px solid var(--border-color); margin: 1rem 0; opacity: 0.5;">
                            ${Ze("Income Probability Floor","probFloor",S.probFloor,0,100,"%")}
                            ${Ze("Monthly Burn Delta","burnDelta",S.burnDelta,-30,30,"%")}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Strategic Advice</div>
                        <div class="fin-advice-intro">
                            <span class="fin-advice-icon" aria-hidden="true">
                                <svg viewBox="0 0 20 20" class="fin-advice-icon-svg">
                                    <circle cx="10" cy="10" r="6.5"></circle>
                                    <path d="M10 5.2V10l3.2 2.2"></path>
                                </svg>
                            </span>
                            <span>Based on your current state:</span>
                        </div>
                        <ul class="fin-advice-list">
                            ${o.map(y=>`<li>${y}</li>`).join("")}
                        </ul>
                        ${m?`
                            <button class="fin-inline-link" type="button" data-fin-action="toggle-advice">
                                ${b?"Show less":"Show more"}
                            </button>
                        `:""}
                        <div id="fin-lab-scenario" class="fin-scenario-line">${Ue()}</div>
                    </div>
                </div>
            </section>
        `}function ce(){const c=[],m=(typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter||"all"):[]).find(z=>z.type==="buffer");t.runwayMonths==null?c.push("Runway is unknown until monthly burn is noted."):Number(t.runwayMonths)<2?c.push("Runway is under 2 months. Consider easing cash outflow."):Number(t.runwayMonths)<4&&c.push("Runway is under 4 months. It may help to favor steadier income."),Number(t.totalDebt)>Math.max(1,Number(t.realBalance))&&c.push("Debt is higher than cash on hand.");const y=K(t.missingInputs);y.length&&c.push("Missing: "+y.slice(0,3).join(", ")),Fe()&&c.push("Weekly review is due. Reconcile cash accounts and leave a short note."),m&&Number(m.progressPercent)<100&&c.push(`Buffer goal is ${Math.round(Number(m.progressPercent)||0)}% funded.`);const V=c.slice(0,3),p=[];t.runwayMonths!=null&&Number(t.runwayMonths)>=4&&p.push("Runway has some breathing room."),t.monthlyBurn!=null&&p.push("Monthly burn is noted."),y.length||p.push("Core inputs are complete."),Number(t.totalDebt)<=Math.max(1,Number(t.realBalance))&&p.push("Debt is not outweighing cash on hand."),Fe()||p.push("Weekly review is current."),m&&Number(m.progressPercent)>=100&&p.push("Safety buffer is funded.");const O=p.slice(0,3);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Signals</div>
                    <div class="fin-signals-grid">
                        <div class="fin-signal-column fin-signal-column--stable">
                            <div class="fin-signal-title">Stability</div>
                            <div class="fin-signal-list">
                                ${O.length?O.map(z=>`<div class="fin-signal-row">${z}</div>`).join(""):'<div class="fin-compact-empty">No stabilizers yet.</div>'}
                            </div>
                        </div>
                        <div class="fin-signal-column fin-signal-column--tension">
                            <div class="fin-signal-title">Tension</div>
                            <div class="fin-signal-list">
                                ${V.length?V.map(z=>`<div class="fin-signal-row">${z}</div>`).join(""):'<div class="fin-compact-empty">No major tension right now.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `}function Ze(c,o,m,y,V,p){return`
            <div class="fin-slider-item">
                <div class="fin-slider-header">
                    <label>${c}</label>
                    <span id="val-${o}">${m}${p}</span>
                </div>
                <input type="range" class="fin-range" id="slip-${o}" min="${y}" max="${V}" value="${m}">
            </div>
        `}function s(){const c=document.getElementById("fin-projection-svg");if(!c||!window.FinancialEngine||typeof window.FinancialEngine.generateProjections!="function")return;const o=window.FinancialEngine.generateProjections({financeSnapshot:t,financeReadModel:e},{burnChange:Number(S.burnDelta||0)/100,probFloor:Number(S.probFloor||50),marketShift:Number(S.marketMajors||0)/100}),m=o.safe||[],y=o.realistic||[],V=o.optimistic||[],p=m.concat(y).concat(V),O=Math.max(1,...p),z=Math.min(0,...p),oe=960,we=280,T=24,re=12,U=16,v=28,Z=(oe-T-re)/Math.max(1,m.length-1),le=function(at){const et=O-z||1;return U+(O-at)/et*(we-U-v)},nt=function(at){return at.map((et,an)=>`${an===0?"M":"L"} ${T+an*Z} ${le(et)}`).join(" ")};c.innerHTML=`
            <rect x="0" y="0" width="${oe}" height="${we}" fill="var(--fin-chart-bg)"></rect>
            <line x1="${T}" y1="${le(0)}" x2="${oe-re}" y2="${le(0)}" stroke="var(--fin-chart-grid)" stroke-width="1"></line>
            <path d="${nt(m)}" fill="none" stroke="var(--fin-chart-safe)" stroke-width="2.35"></path>
            <path d="${nt(y)}" fill="none" stroke="var(--fin-chart-realistic)" stroke-width="2.35"></path>
            <path d="${nt(V)}" fill="none" stroke="var(--fin-chart-optimistic)" stroke-width="1.9"></path>
        `}function k(){["marketMajors","burnDelta","probFloor"].forEach(o=>{const m=document.getElementById("slip-"+o);!m||m.dataset.bound==="1"||(m.dataset.bound="1",m.addEventListener("input",function(){S[o]=Number(m.value)||0,window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scenario:S});const y=document.getElementById("val-"+o);y&&(y.textContent=m.value+"%");const V=document.getElementById("fin-lab-scenario");V&&(V.textContent=Ue()),s()}))})}function se(c,o){console.log("[FinancialMode] Opening modal for:",c),window.openEditModal&&(o?window.openEditModal(c,{id:String(o)}):window.openEditModal(c))}function ke(){if(!window.Store)return;const c=document.getElementById("page-settings-currency"),o=document.getElementById("page-settings-forecast"),m=document.getElementById("page-settings-scope"),y=document.getElementById("page-settings-appearance"),V=document.getElementById("page-settings-reduced-motion");if(c&&o&&m&&y&&V)try{window.Store.saveFinanceSettings({baseCurrency:c.value||"EUR",forecastDays:Number(o.value)||90}),window.Store.saveUiSettings({appearance:y.value||"bright",reducedMotion:V.checked,scopeFilter:m.value||"all"}),window.applyAppearance&&window.applyAppearance(window.Store),window.FinancialMode.render()}catch(p){console.error("Failed to save settings:",p),window.showModalError&&window.showModalError(p.message||"Could not save settings.")}}function It(c,o){const m=K(e?.recurringExpenses),y=m.find(U=>String(U.id)===String(c));if(!y)return;const V=y.essential,p=m.filter(U=>U.essential===V),O={};try{const U=localStorage.getItem("finance-master.ui.expenseOrder");U&&JSON.parse(U).forEach((Z,le)=>O[Z]=le)}catch{}p.sort((U,v)=>{const Z=O.hasOwnProperty(U.id)?O[U.id]:99999,le=O.hasOwnProperty(v.id)?O[v.id]:99999;return Z-le});const z=p.findIndex(U=>String(U.id)===String(c));if(z===-1)return;const oe=z+Number(o);if(oe<0||oe>=p.length)return;const we=p[z];p[z]=p[oe],p[oe]=we;const T=m.filter(U=>U.essential!==V);T.sort((U,v)=>{const Z=O.hasOwnProperty(U.id)?O[U.id]:99999,le=O.hasOwnProperty(v.id)?O[v.id]:99999;return Z-le});const re=[...V?p:T,...V?T:p].map(U=>String(U.id));try{localStorage.setItem("finance-master.ui.expenseOrder",JSON.stringify(re))}catch{}pe()}return{init:_e,render:pe,setSection:N,toggleMobileNav:Ce,closeMobileNav:be,setFocusMode:F,setPipelineTab:E,openAddModal:se,saveSettingsPage:ke,moveExpense:It}})();window.Store=G;window.FinanceFormatting={formatCurrencyAmount:ca,resolveCurrencyCode:Hn};await G.initialize();G.seedDemoIfNeeded();Nn(G);window.FinancialMode?.init();window.addEventListener("finance:ui-updated",()=>{Nn(G),window.FinancialMode?.render()});
