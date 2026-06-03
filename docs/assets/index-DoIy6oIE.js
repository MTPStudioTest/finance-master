(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const d of o)if(d.type==="childList")for(const l of d.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const d={};return o.integrity&&(d.integrity=o.integrity),o.referrerPolicy&&(d.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?d.credentials="include":o.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function a(o){if(o.ep)return;o.ep=!0;const d=n(o);fetch(o.href,d)}})();const On={attention:'<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 4v2"></path><path d="M20 12h-2"></path><path d="M12 20v-2"></path><path d="M4 12h2"></path>',edit:'<path d="M4 16.5V20h3.5L18.2 9.3l-3.5-3.5L4 16.5Z"></path><path d="M12.9 7.1l3.5 3.5"></path>',sprout:'<path d="M12 20v-7"></path><path d="M12 13c-2.8 0-5-2.2-5-5.1 2.8 0 5 2.2 5 5.1Z"></path><path d="M12 13c2.8 0 5-2.2 5-5.1-2.8 0-5 2.2-5 5.1Z"></path>',success:'<path d="m5 12 4 4 10-10"></path>',warning:'<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4.5"></path><path d="M12 16.5h.01"></path>'};window.renderSAGIcon=(e,t={})=>{const n=On[e]||On.attention,a=t.size?` sag-icon--${t.size}`:"",o=t.tone?` sag-tone-${t.tone}`:"";return`<svg class="sag-icon${a}${o}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g>${n}</g></svg>`};(function(e){function t(A){return String(A).padStart(2,"0")}function n(A,w,W){var V=Number(A),h=Number(w),v=Number(W);if(!Number.isInteger(V)||!Number.isInteger(h)||!Number.isInteger(v))return"";var M=new Date(Date.UTC(V,h-1,v,12,0,0,0));return M.getUTCFullYear()!==V||M.getUTCMonth()!==h-1||M.getUTCDate()!==v?"":V+"-"+t(h)+"-"+t(v)}function a(A){var w=String(A||"").trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(w))return!1;var W=w.split("-").map(Number);return n(W[0],W[1],W[2])===w}function o(A){if(A==null||A==="")return"";if(typeof A=="number"||Object.prototype.toString.call(A)==="[object Date]"){var w=new Date(A);return Number.isFinite(w.getTime())?n(w.getUTCFullYear(),w.getUTCMonth()+1,w.getUTCDate()):""}var W=String(A).trim();if(a(W))return W;var V=Date.parse(W);if(!Number.isFinite(V))return"";var h=new Date(V);return n(h.getUTCFullYear(),h.getUTCMonth()+1,h.getUTCDate())}function d(){var A=new Date;return n(A.getFullYear(),A.getMonth()+1,A.getDate())}function l(A){var w=o(A);return w?w+"T12:00:00.000Z":new Date().toISOString()}function u(A,w){var W=o(A);if(!W)return"";var V=W.split("-").map(Number),h=new Date(Date.UTC(V[0],V[1]-1,V[2]+(Number(w)||0),12,0,0,0));return n(h.getUTCFullYear(),h.getUTCMonth()+1,h.getUTCDate())}function y(A){var w=o(A);return w?w.slice(0,7):""}function b(A,w){var W=o(A),V=o(w);return!W||!V?0:W<V?-1:W>V?1:0}e.FinanceDates={addDaysDateOnly:u,compareDateOnly:b,dateOnlyFromParts:n,dateOnlyToNoonIso:l,isDateOnly:a,monthKey:y,todayDateOnly:d,toDateOnly:o}})(typeof window<"u"?window:globalThis);(function(e){var t=["income.received","expense.recorded","expense.recurring_set","obligation.reviewed","debt.added","debt.payment_made","invoice.sent","invoice.paid","pipeline.created","pipeline.stage_changed","pipeline.value_changed","pipeline.probability_changed","transaction.reviewed","debt.plan_updated","transfer.recorded","cash.adjusted"],n=["balance.opening_set","asset.account_set","asset.position_set","asset.defi_set","asset.reserve_set","asset.reserve_allocated","finance.event_reversed"],a=t.concat(n);function o(k){if(k!==void 0)try{return JSON.parse(JSON.stringify(k))}catch{return k}}function d(k){var F=Number(k);return Number.isFinite(F)?Math.round(F*100)/100:0}function l(){try{if(e.crypto&&typeof e.crypto.randomUUID=="function")return e.crypto.randomUUID()}catch{}return"fin-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10)}function u(k,F){var C=String(k||F||"EUR").trim().toUpperCase();return C||"EUR"}function y(k){var F=Number(k);return!Number.isFinite(F)||F<0?0:F>1?1:F}function b(k){return a.indexOf(String(k||"").trim())!==-1}function A(k){if(typeof k!="string"||!k.trim())return!1;var F=Date.parse(k);return Number.isFinite(F)?k.indexOf("T")!==-1:!1}function w(k){return A(k)?new Date(k).toISOString():null}function W(k,F){var C=Date.parse(k);if(!Number.isFinite(C))return null;var R=new Date(C);try{var te=new Intl.DateTimeFormat("en-CA",{timeZone:F||void 0,year:"numeric",month:"2-digit",day:"2-digit"}),de=te.formatToParts(R),ve=de.find(function(oe){return oe.type==="year"}),J=de.find(function(oe){return oe.type==="month"}),B=de.find(function(oe){return oe.type==="day"});if(ve&&J&&B)return ve.value+"-"+J.value+"-"+B.value}catch{}var N=R.getFullYear(),L=String(R.getMonth()+1).padStart(2,"0"),K=String(R.getDate()).padStart(2,"0");return N+"-"+L+"-"+K}function V(k){var F=Number(k);return Number.isFinite(F)?Math.round(F*100):0}function h(k){var F=Number(k);return Number.isFinite(F)?Math.round(F)/100:0}function v(k){var F=Array.isArray(k)?k.slice():[];return F.sort(function(C,R){var te=Date.parse(C&&C.timestamp?C.timestamp:"")||0,de=Date.parse(R&&R.timestamp?R.timestamp:"")||0;if(te!==de)return te-de;var ve=Date.parse(C&&C.created_at?C.created_at:"")||0,J=Date.parse(R&&R.created_at?R.created_at:"")||0;if(ve!==J)return ve-J;var B=String(C&&C.id||""),N=String(R&&R.id||"");return B.localeCompare(N)})}function M(k,F){var C=F||{},R=k&&typeof k=="object"?k:{},te=String(R.type||"").trim();if(!b(te))throw new Error("Invalid financial event type: "+te);var de=Number(R.amount);if(!Number.isFinite(de))throw new Error("Financial event amount must be a finite number.");var ve=w(C.nowIso)||new Date().toISOString(),J=w(R.timestamp);if(!J&&C.allowApproximateTimestamp){var B=R.timestamp||R.created_at||ve,N=Date.parse(B);Number.isFinite(N)&&(J=new Date(N).toISOString())}if(!J)throw new Error("Financial event timestamp is required and must be ISO-8601.");var L={id:String(R.id||l()),timestamp:J,type:te,amount:d(de),currency:u(R.currency,C.baseCurrency),metadata:o(R.metadata&&typeof R.metadata=="object"?R.metadata:{}),created_at:w(R.created_at)||ve};return R.related_entity_id!=null&&String(R.related_entity_id).trim()&&(L.related_entity_id=String(R.related_entity_id).trim()),R.updated_at&&A(R.updated_at)&&(L.updated_at=new Date(R.updated_at).toISOString()),!R.timestamp&&C.allowApproximateTimestamp&&(L.metadata.approximateTimestamp=!0),L}function E(k){var F=new Set,C=v(k);return C.forEach(function(R){if(!(!R||R.type!=="finance.event_reversed")){var te=R.related_entity_id||R.metadata&&R.metadata.reversed_event_id||R.metadata&&R.metadata.event_id||null;te&&F.add(String(te))}}),F}var Y={REQUIRED_EVENT_TYPES:t,SUPPLEMENTAL_EVENT_TYPES:n,ALL_EVENT_TYPES:a,deepClone:o,roundMoney:d,createId:l,normalizeCurrency:u,clampProbability:y,isValidEventType:b,isIsoTimestamp:A,localDateKey:W,toMinor:V,fromMinor:h,sortFinancialEvents:v,createFinancialEvent:M,resolveReversedEventIds:E};typeof module<"u"&&module.exports&&(module.exports=Y),e.FinanceEvents=Y})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!t)throw new Error("FinanceEvents is required before FinanceLedger.");function n(h){return Array.isArray(h)?h:[]}function a(h){var v=h&&typeof h=="object"?h:{};return{baseCurrency:t.normalizeCurrency(v.baseCurrency,"EUR"),forecastDays:Number.isFinite(Number(v.forecastDays))?Math.max(1,Math.floor(Number(v.forecastDays))):90,nowIso:t.isIsoTimestamp(v.nowIso)?new Date(v.nowIso).toISOString():new Date().toISOString()}}function o(h){var v=String(h||"monthly").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return v==="week"?"weekly":v==="two_weekly"||v==="every_two_weeks"||v==="fortnightly"?"biweekly":v==="month"?"monthly":v==="quarter"?"quarterly":v==="annual"||v==="annually"?"yearly":["weekly","biweekly","monthly","quarterly","yearly"].includes(v)?v:"monthly"}function d(h,v){var M=Math.abs(Number(h)||0),E=o(v);return E==="weekly"?t.roundMoney(M*52/12):E==="biweekly"?t.roundMoney(M*26/12):E==="quarterly"?t.roundMoney(M/3):E==="yearly"?t.roundMoney(M/12):t.roundMoney(M)}function l(h,v){var M=t.normalizeCurrency(h&&h.currency,v);if(M!==t.normalizeCurrency(v,"EUR"))throw new Error("Event currency must match base currency ("+v+").")}function u(h,v,M,E){var Y=a(M),k=E||{},F=n(h).slice(),C=[];return n(v).forEach(function(R){if(!(!R||typeof R!="object")){l(R,Y.baseCurrency);var te=t.createFinancialEvent(R,{baseCurrency:Y.baseCurrency,nowIso:k.nowIso||Y.nowIso,allowApproximateTimestamp:!!k.allowApproximateTimestamp});F.push(te),C.push(te)}}),{events:t.sortFinancialEvents(F),appended:C}}function y(h,v,M,E,Y){var k=t.sortFinancialEvents(h),F=k.find(function(R){return R&&String(R.id)===String(v)});if(!F)throw new Error("Cannot reverse missing finance event: "+v);var C={type:"finance.event_reversed",amount:0,currency:F.currency||E&&E.baseCurrency||"EUR",related_entity_id:String(F.id),timestamp:Y&&Y.timestamp||E&&E.nowIso||new Date().toISOString(),metadata:{reason:String(M||"undo"),reversed_event_id:String(F.id)}};return u(h,[C],E,Y)}function b(h){var v=t.sortFinancialEvents(h),M=t.resolveReversedEventIds(v);return v.filter(function(E){return!E||E.type==="finance.event_reversed"?!1:!M.has(String(E.id))})}function A(h){var v=String(h||"").toLowerCase();return v!=="paid"&&v!=="closed"&&v!=="lost"&&v!=="cancelled"&&v!=="deleted"}function w(h){return t.toDateOnly?t.toDateOnly(h):e.FinanceDates?e.FinanceDates.toDateOnly(h):""}function W(h,v){var M=a(v),E=M.nowIso,Y=Date.parse(E),k=720*60*60*1e3,F=b(h),C=Object.create(null),R=Object.create(null),te=Object.create(null),de=Object.create(null),ve=Object.create(null),J=Object.create(null),B=Object.create(null),N=Object.create(null),L=Object.create(null),K=Object.create(null),oe=[],X=0;F.forEach(function(m){var i=m.metadata&&typeof m.metadata=="object"?m.metadata:{},I=String(m.related_entity_id||i.entity_id||i.id||m.id),ne=Number(m.amount)||0,Me=Date.parse(m.timestamp),Se=Number.isFinite(Me)?Math.max(0,Y-Me):Number.POSITIVE_INFINITY;if(m.type==="income.received"||m.type==="expense.recorded"||m.type==="transfer.recorded"||m.type==="cash.adjusted"){var ke=String(i.direction||"").trim(),Je=ne;m.type==="expense.recorded"&&(ke="out"),m.type==="income.received"&&(ke="in"),m.type==="transfer.recorded"&&(ke="transfer"),m.type==="cash.adjusted"&&(ke=ke==="decrease"?"out":"in"),(m.type==="expense.recorded"||m.type==="cash.adjusted"&&ke==="out")&&(Je=-Math.abs(ne)),oe.push({id:m.id,transactionEntityId:I,type:m.type,ledgerType:String(i.ledgerType||(m.type==="income.received"?"income":m.type==="expense.recorded"?"expense":m.type==="transfer.recorded"?"transfer":"adjustment")),direction:ke,description:String(i.description||m.type),amount:ne,signedAmount:Je,currency:m.currency,accountId:String(i.accountId||"").trim(),accountName:String(i.accountName||"").trim(),fromAccountId:String(i.fromAccountId||"").trim(),fromAccountName:String(i.fromAccountName||"").trim(),toAccountId:String(i.toAccountId||"").trim(),toAccountName:String(i.toAccountName||"").trim(),categoryId:String(i.categoryId||"uncategorized"),scope:String(i.scope||"shared"),source:String(i.source||"manual"),importBatchId:String(i.importBatchId||"").trim(),fingerprint:String(i.fingerprint||"").trim(),obligationId:String(i.obligationId||"").trim(),obligationDueDate:String(i.obligationDueDate||"").trim(),obligationTitle:String(i.obligationTitle||"").trim(),linkedIncomeId:String(i.invoiceId||i.pipelineId||i.linkedIncomeId||"").trim(),reviewStatus:String(i.reviewStatus||"").trim()||(String(i.categoryId||"uncategorized").toLowerCase()==="uncategorized"?"needs_review":"clear"),reviewNotes:"",timestamp:m.timestamp})}if(m.type==="income.received"&&Se<=k&&(X+=t.toMinor(ne)),m.type==="pipeline.created"){C[I]={id:I,title:String(i.title||i.name||i.client||"Pipeline Item"),value:Number.isFinite(Number(i.value))?Number(i.value):ne,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||m.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:m.currency,createdAt:m.timestamp,updatedAt:m.timestamp};return}if(m.type==="pipeline.stage_changed"){C[I]||(C[I]={id:I,title:String(i.title||i.name||"Pipeline Item"),value:0,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||m.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:m.currency,createdAt:m.timestamp,updatedAt:m.timestamp}),C[I].status=String(i.stage||i.status||C[I].status||"open"),C[I].scope=String(i.scope||C[I].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(C[I].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),(i.title||i.name)&&(C[I].title=String(i.title||i.name)),i.scenarioInclusion&&(C[I].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(C[I].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(C[I].destinationAccountName=String(i.destinationAccountName||"").trim()),C[I].updatedAt=m.timestamp;return}if(m.type==="pipeline.value_changed"){C[I]||(C[I]={id:I,title:String(i.title||i.name||"Pipeline Item"),value:0,probability:t.clampProbability(i.probability!=null?i.probability:1),status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||m.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:m.currency,createdAt:m.timestamp,updatedAt:m.timestamp}),C[I].value=Number.isFinite(Number(i.value))?Number(i.value):ne,C[I].scope=String(i.scope||C[I].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(C[I].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),(i.title||i.name)&&(C[I].title=String(i.title||i.name)),i.scenarioInclusion&&(C[I].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(C[I].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(C[I].destinationAccountName=String(i.destinationAccountName||"").trim()),C[I].updatedAt=m.timestamp;return}if(m.type==="pipeline.probability_changed"){C[I]||(C[I]={id:I,title:String(i.title||i.name||"Pipeline Item"),value:Number.isFinite(Number(i.value))?Number(i.value):ne,probability:1,status:String(i.stage||i.status||"open"),expectedDateISO:w(i.expectedDateISO||i.expectedDate||m.timestamp),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),scenarioInclusion:String(i.scenarioInclusion||"realistic"),currency:m.currency,createdAt:m.timestamp,updatedAt:m.timestamp}),C[I].probability=t.clampProbability(i.probability!=null?i.probability:ne),C[I].scope=String(i.scope||C[I].scope||"shared"),(i.expectedDateISO||i.expectedDate)&&(C[I].expectedDateISO=w(i.expectedDateISO||i.expectedDate)),i.scenarioInclusion&&(C[I].scenarioInclusion=String(i.scenarioInclusion)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(C[I].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(C[I].destinationAccountName=String(i.destinationAccountName||"").trim()),C[I].updatedAt=m.timestamp;return}if(m.type==="invoice.sent"){R[I]={id:I,client:String(i.client||i.title||i.name||"Invoice"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,expectedDate:w(i.expectedDate||i.expectedDateISO||m.timestamp),status:String(i.status||"Sent"),destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),currency:m.currency,sentAt:m.timestamp,paidAt:null};return}if(m.type==="invoice.paid"){R[I]||(R[I]={id:I,client:String(i.client||i.title||i.name||"Invoice"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,expectedDate:w(i.expectedDate||i.expectedDateISO||m.timestamp),status:"Paid",destinationAccountId:String(i.destinationAccountId||"").trim(),destinationAccountName:String(i.destinationAccountName||"").trim(),scope:String(i.scope||"shared"),currency:m.currency,sentAt:m.timestamp,paidAt:m.timestamp}),R[I].status="Paid",R[I].paidAt=m.timestamp,R[I].scope=String(i.scope||R[I].scope||"shared"),Number.isFinite(Number(i.amount))&&(R[I].amount=Number(i.amount)),Object.prototype.hasOwnProperty.call(i,"destinationAccountId")&&(R[I].destinationAccountId=String(i.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(i,"destinationAccountName")&&(R[I].destinationAccountName=String(i.destinationAccountName||"").trim());return}if(m.type==="expense.recurring_set"){var Xe=o(i.frequency),se=Number.isFinite(Number(i.amount))?Math.abs(Number(i.amount)):Math.abs(ne),Be=Number.isFinite(Number(i.monthlyAmount))?Math.abs(Number(i.monthlyAmount)):d(se,Xe);te[I]={id:I,category:String(i.category||i.name||"Recurring Expense"),amount:se,monthlyAmount:Be,essential:!!i.essential,active:i.active!==!1,dueDay:Math.max(1,Math.min(28,Number(i.dueDay)||1)),frequency:Xe,linkedDebtId:String(i.linkedDebtId||i.debtId||"").trim(),scope:String(i.scope||"shared"),currency:m.currency,updatedAt:m.timestamp};return}if(m.type==="obligation.reviewed"){de[I]={id:I,status:String(i.status||"needs_review").toLowerCase(),title:String(i.title||"Obligation"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):ne,dueDate:String(i.dueDate||""),paidAt:String(i.paidAt||""),deferredUntil:String(i.deferredUntil||""),accountId:String(i.accountId||""),accountName:String(i.accountName||""),transactionId:String(i.transactionId||""),notes:String(i.notes||""),reviewedAt:m.timestamp,currency:m.currency,scope:String(i.scope||"shared")};return}if(m.type==="transaction.reviewed"){ve[I]={id:I,categoryId:String(i.categoryId||"").trim(),scope:String(i.scope||"").trim(),reviewStatus:String(i.reviewStatus||"reviewed").trim(),notes:String(i.notes||""),obligationId:String(i.obligationId||"").trim(),obligationTitle:String(i.obligationTitle||"").trim(),reviewedAt:m.timestamp};return}if(m.type==="debt.added"||m.type==="debt.payment_made"||m.type==="debt.plan_updated"){J[I]||(J[I]={id:I,name:String(i.name||i.lender||"Debt"),totalAdded:0,totalPaid:0,outstanding:0,dueDate:"",minimumPayment:0,minimumPaymentMonthly:0,paymentPlanNote:"",planType:"regular",frequency:"monthly",installments:[],planReviewedAt:"",scope:String(i.scope||"shared"),currency:m.currency,updatedAt:m.timestamp}),m.type==="debt.added"?(J[I].totalAdded+=Math.max(0,ne),i.dueDate&&(J[I].dueDate=w(i.dueDate)),Number.isFinite(Number(i.minimumPayment))&&(J[I].minimumPayment=Math.max(0,Number(i.minimumPayment))),i.paymentPlanNote&&(J[I].paymentPlanNote=String(i.paymentPlanNote)),J[I].frequency=o(i.frequency||J[I].frequency)):m.type==="debt.payment_made"?J[I].totalPaid+=Math.max(0,ne):(i.dueDate&&(J[I].dueDate=w(i.dueDate)),J[I].minimumPayment=Math.max(0,Number(i.minimumPayment)||0),J[I].paymentPlanNote=String(i.paymentPlanNote||""),J[I].planType=String(i.planType||"regular"),J[I].frequency=o(i.frequency),J[I].installments=Array.isArray(i.installments)?i.installments:[],J[I].planReviewedAt=m.timestamp),J[I].outstanding=Math.max(0,J[I].totalAdded-J[I].totalPaid),J[I].minimumPaymentMonthly=d(J[I].minimumPayment,J[I].frequency),J[I].scope=String(i.scope||J[I].scope||"shared"),J[I].updatedAt=m.timestamp;return}if(m.type==="asset.account_set"){B[I]={id:I,name:String(i.name||"Account"),balance:Number.isFinite(Number(i.balance))?Number(i.balance):ne,currency:m.currency,active:i.active!==!1,scope:String(i.scope||"shared"),bucket:String(i.bucket||i.reserveBucket||"available"),reserved:!!i.reserved||i.bucket&&String(i.bucket)!=="available",updatedAt:m.timestamp};return}if(m.type==="asset.position_set"){N[I]={id:I,symbolOrName:String(i.symbolOrName||i.symbol||"TOKEN"),amount:Number.isFinite(Number(i.amount))?Number(i.amount):0,price:Number.isFinite(Number(i.price))?Number(i.price):0,liquidity:String(i.liquidity||"med"),chain:String(i.chain||"Unknown"),scope:String(i.scope||"shared"),priceSource:String(i.priceSource||"manual"),priceUpdatedAt:String(i.priceUpdatedAt||m.timestamp),manualPriceOverride:i.manualPriceOverride!==!1,updatedAt:m.timestamp};return}if(m.type==="asset.defi_set"){L[I]={id:I,protocol:String(i.protocol||i.name||"Protocol"),collateralValue:Number.isFinite(Number(i.collateralValue))?Number(i.collateralValue):0,debtValue:Number.isFinite(Number(i.debtValue))?Number(i.debtValue):0,riskScore:String(i.riskScore||"Low"),scope:String(i.scope||"shared"),updatedAt:m.timestamp};return}if(m.type==="asset.reserve_set"){K[I]={id:I,name:String(i.name||"Reserve"),targetAmount:Number.isFinite(Number(i.targetAmount))?Number(i.targetAmount):ne,currentAmount:Number.isFinite(Number(i.currentAmount))?Number(i.currentAmount):ne,linkedCashAccountId:String(i.linkedCashAccountId||"").trim()||null,purpose:String(i.purpose||"custom"),priority:String(i.priority||"medium"),scope:String(i.scope||"shared"),notes:String(i.notes||""),active:i.active!==!1,updatedAt:m.timestamp};return}if(m.type==="asset.reserve_allocated"){if(!K[I])return;Number.isFinite(Number(i.currentAmount))?K[I].currentAmount=Number(i.currentAmount):Number.isFinite(ne)&&(K[I].currentAmount=ne),K[I].updatedAt=m.timestamp;return}});var Ce=Object.keys(C).map(function(m){return C[m]}),be=Object.keys(te).map(function(m){return te[m]}),fe=Object.keys(de).map(function(m){return de[m]}),he=be.filter(function(m){return m&&m.active!==!1}),ue=Object.keys(J).map(function(m){return J[m]}),we=Object.keys(R).map(function(m){return R[m]});Object.keys(K).map(function(m){return K[m]});var re=Object.create(null);Object.keys(de).forEach(function(m){var i=de[m];i&&i.transactionId&&(re[String(i.transactionId)]=i)}),oe=oe.map(function(m){var i=ve[String(m.id)]||ve[String(m.transactionEntityId)]||null,I=re[String(m.id)]||re[String(m.transactionEntityId)]||null,ne=i&&i.categoryId?i.categoryId:m.categoryId,Me=i&&i.scope?i.scope:m.scope,Se=m.obligationId||i&&i.obligationId||I&&I.id||"";return Object.assign({},m,{categoryId:ne,scope:Me,obligationId:Se,obligationTitle:m.obligationTitle||i&&i.obligationTitle||I&&I.title||"",reviewStatus:i&&i.reviewStatus?i.reviewStatus:String(ne||"").toLowerCase()==="uncategorized"?"needs_review":Se?"reviewed":m.reviewStatus,reviewNotes:i&&i.notes?i.notes:m.reviewNotes})}),oe.sort(function(m,i){return(Date.parse(i.timestamp||"")||0)-(Date.parse(m.timestamp||"")||0)}),Ce.sort(function(m,i){var I=Date.parse(m.expectedDateISO||"")||0,ne=Date.parse(i.expectedDateISO||"")||0;return I!==ne?I-ne:String(m.id).localeCompare(String(i.id))}),we.sort(function(m,i){var I=Date.parse(m.expectedDate||"")||0,ne=Date.parse(i.expectedDate||"")||0;return I!==ne?I-ne:String(m.id).localeCompare(String(i.id))});var Ke=he.reduce(function(m,i){return m+(Number(i.monthlyAmount)||0)},0),j=Ce.filter(function(m){return A(m.status)}).reduce(function(m,i){return m+(Number(i.value)||0)*t.clampProbability(i.probability)},0),nt=new Date(Y);nt.setDate(nt.getDate()+M.forecastDays);var _e=Ce.filter(function(m){return A(m.status)}).filter(function(m){var i=Date.parse(m.expectedDateISO||"");return Number.isFinite(i)?i>=Y&&i<=nt.getTime():!1}).reduce(function(m,i){return m+(Number(i.value)||0)*t.clampProbability(i.probability)},0),Ee=ue.reduce(function(m,i){return m+Math.max(0,Number(i.outstanding)||0)},0),at=Object.keys(B).map(function(m){return B[m]}).filter(function(m){return m&&m.active!==!1}),it=Object.keys(N).map(function(m){return N[m]}),gt=Object.keys(L).map(function(m){return L[m]});return{currency:M.baseCurrency,asOf:M.nowIso,eventsCount:F.length,pipelineDeals:Ce,recurringExpenses:he,obligationReviews:fe,debtAccounts:ue,invoices:we,transactions:oe,fiatAccounts:at,web3Positions:it,defiPositions:gt,recurringMonthlyTotal:t.roundMoney(Ke),weightedPipeline:t.roundMoney(j),expectedPipeline90d:t.roundMoney(_e),debtTotal:t.roundMoney(Ee),incomeReceivedLast30Days:t.fromMinor(X),monthlyIncomeEstimate:t.roundMoney(t.fromMinor(X)+_e),invoicesSentCount:we.filter(function(m){return String(m.status||"").toLowerCase()!=="paid"}).length,openPipelineCount:Ce.filter(function(m){return A(m.status)}).length}}var V={normalizeSettings:a,appendEvents:u,reverseEvent:y,getActiveEvents:b,buildReadModel:W,isPipelineActive:A,normalizeFrequency:o,normalizeRecurrenceMonthlyAmount:d};typeof module<"u"&&module.exports&&(module.exports=V),e.FinanceLedger=V})(typeof window<"u"?window:globalThis);(function(e){function t(d){var l=Number(d);return Number.isFinite(l)?Math.round(l*100)/100:0}function n(d,l,u){var y=Number.isFinite(Number(u))?Number(u):.01;return Math.abs((Number(d)||0)-(Number(l)||0))<=y}function a(d){var l=d&&typeof d=="object"?d:{},u=l.snapshot&&typeof l.snapshot=="object"?l.snapshot:{},y=l.components&&typeof l.components=="object"?l.components:{},b=[],A=t(y.realBalanceFromSums);if(n(u.realBalance,A,.01)||b.push({id:"real-balance-consistency",message:"Real balance does not match ledger sums.",expected:A,actual:t(u.realBalance),severity:"high"}),u.monthlyBurn==null)u.runwayMonths!==null&&b.push({id:"runway-null-when-burn-missing",message:"Runway must be null when monthly burn is undefined.",expected:null,actual:u.runwayMonths,severity:"medium"});else if(Number(u.monthlyBurn)===0)u.runwayMonths!==null&&b.push({id:"runway-null-when-burn-zero",message:"Runway must be null when monthly burn is zero.",expected:null,actual:u.runwayMonths,severity:"medium"});else{var w=Number.isFinite(Number(u.availableCash))?Number(u.availableCash):Number.isFinite(Number(u.trulyAvailableCash))?Number(u.trulyAvailableCash):Number(u.realBalance),W=t((w||0)/(Number(u.monthlyBurn)||1));n(u.runwayMonths,W,.01)||b.push({id:"runway-formula",message:"Runway is inconsistent with available cash / burn.",expected:W,actual:t(u.runwayMonths),severity:"high"})}var V=t(y.weightedPipelineFromDeals);n(u.weightedPipeline,V,.01)||b.push({id:"pipeline-sum-consistency",message:"Weighted pipeline does not match deal list.",expected:V,actual:t(u.weightedPipeline),severity:"high"});var h=t(y.totalDebtFromLiabilities);return n(u.totalDebt,h,.01)||b.push({id:"debt-total-consistency",message:"Debt total does not match liability ledger.",expected:h,actual:t(u.totalDebt),severity:"high"}),{ok:b.length===0,violations:b,messages:b.map(function(v){return v.message})}}var o={evaluateFinancialInvariants:a};typeof module<"u"&&module.exports&&(module.exports=o),e.FinanceInvariants=o})(typeof window<"u"?window:globalThis);(function(e){function t(l){var u=Number(l);return!Number.isFinite(u)||u<0?0:u>1?1:u}function n(l){var u=t(l);return u>=.75?"HIGH":u>=.45?"MEDIUM":"LOW"}function a(l){var u=new Set,y=[];return(Array.isArray(l)?l:[]).forEach(function(b){var A=String(b||"").trim();!A||u.has(A)||(u.add(A),y.push(A))}),y}function o(l){var u=l&&typeof l=="object"?l:{},y=1,b=[],A=[];u.missingRecurringExpenses&&(y-=.12,b.push("recurring expenses"),A.push("Missing recurring expenses configuration.")),u.noRecentData&&(y-=.15,b.push("recent financial activity"),A.push("No recent finance data in last 30 days.")),u.undefinedBurn&&(y-=.25,b.push("monthly burn"),A.push("Monthly burn is undefined.")),u.emptyPipeline&&(y-=.1,b.push("pipeline"),A.push("Pipeline is empty.")),u.staleCompute&&(y-=.08,b.push("compute freshness"),A.push("Snapshot is stale versus latest event timestamp."));var w=Array.isArray(u.invariantViolations)?u.invariantViolations.length:0;return w>0&&(y-=Math.min(.4,w*.1),A.push("Invariant checks reported "+w+" violation(s).")),y=t(y),{score:y,level:n(y),missingInputs:a((u.missingInputs||[]).concat(b)),reasons:A}}var d={clamp01:t,confidenceLevel:n,computeConfidenceScore:o};typeof module<"u"&&module.exports&&(module.exports=d),e.FinanceConfidence=d})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceInvariants,o=e.FinanceConfidence;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./invariants.js")),!o&&typeof module<"u"&&module.exports&&(o=require("./confidence.js")),!t||!n||!a||!o)throw new Error("FinanceCompute dependencies are missing.");function d(B){return n.normalizeSettings(B||{})}function l(B){return Array.isArray(B)?B:[]}function u(B,N,L){var K=Date.parse(B);if(!Number.isFinite(K))return!1;var oe=N-K;return oe>=0&&oe<=L*24*60*60*1e3}function y(B,N,L){var K=Date.parse(B);return Number.isFinite(K)?K>=N&&K<=L:!1}function b(B){return n.isPipelineActive(B)}function A(B,N){var L=Number(B);return Number.isFinite(L)?L:Number.isFinite(Number(N))?Number(N):0}function w(B){return t.roundMoney(B)}var W=["tax_reserve","vat_reserve","health_insurance","debt_repayment","personal_survival","business_operating_costs","investment_growth","buffer"];function V(B){var N=String(B||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return N?N==="tax"||N==="taxes"?"tax_reserve":N==="vat"?"vat_reserve":N==="health"||N==="insurance"?"health_insurance":N==="debt"?"debt_repayment":N==="survival"?"personal_survival":N==="business"||N==="operating"?"business_operating_costs":N==="growth"||N==="investment"?"investment_growth":N==="safety_buffer"||N==="safety"?"buffer":N:"available"}function h(B){var N={available:"Available",tax_reserve:"Tax reserve",vat_reserve:"VAT reserve",health_insurance:"Health insurance",debt_repayment:"Debt repayment",personal_survival:"Personal survival",business_operating_costs:"Business operating costs",investment_growth:"Investment growth",buffer:"Buffer"};return N[B]||String(B||"available").replace(/_/g," ")}function v(B,N){var L=e.FinanceDates&&e.FinanceDates.toDateOnly(B);if(L&&e.FinanceDates&&e.FinanceDates.addDaysDateOnly)return new Date(e.FinanceDates.dateOnlyToNoonIso(e.FinanceDates.addDaysDateOnly(L,N)));var K=new Date(B);return K.setUTCDate(K.getUTCDate()+N),K}function M(B){return e.FinanceDates&&e.FinanceDates.toDateOnly?e.FinanceDates.toDateOnly(B):""}function E(B){var N=new Date(B);return new Date(N.getFullYear(),N.getMonth(),1,0,0,0,0)}function Y(B){var N=new Date(B);return new Date(N.getFullYear(),N.getMonth()+1,0,23,59,59,999)}function k(B){var N=String(B&&B.status||"").toLowerCase(),L=t.clampProbability(B&&B.probability);return N==="received"||N==="paid"?"received":N==="cancelled"||N==="lost"||N==="closed"?"cancelled":N==="confirmed"||N==="signed"||L>=.8?"confirmed":N==="risky"||N==="open"||L<.5?"risky":"expected"}function F(B,N){var L=M(B),K=M(N);if(!L||!K)return"needs_review";if(L<K)return"overdue";var oe=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(K,7):M(v(N,7));return L<=oe?"due_soon":"upcoming"}function C(B,N,L,K,oe){return{key:B,label:N,value:w(Number(L)||0),parts:l(K).map(function(X){return{label:String(X&&X.label||""),value:w(Number(X&&X.value)||0),operation:X&&X.operation?String(X.operation):void 0}}),warnings:l(oe).map(function(X){return String(X||"")}).filter(Boolean)}}function R(B){var N=Object.create(null);return l(B).forEach(function(L){if(String(L&&L.type)==="income.received"){var K=String(L&&L.linkedIncomeId||"").trim();K&&(N[K]=!0)}}),N}function te(B,N,L,K){var oe=l(B.fiatAccounts),X=l(B.recurringExpenses),Ce=Object.create(null);l(B.obligationReviews).forEach(function(s){!s||!s.id||(Ce[String(s.id)]=s)});var be=l(B.transactions),fe=R(be),he=l(B.pipelineDeals).filter(function(s){return b(s&&s.status)&&fe[String(s&&s.id||"")]!==!0}),ue=l(B.debtAccounts),we=Object.create(null),re=ue.filter(function(s){var T=Number(s&&s.outstanding)||0,ce=Number(s&&s.minimumPaymentMonthly)||Number(s&&s.minimumPayment)||0;return T<=0||ce<=0?!1:(we[String(s&&s.id||"")]=!0,!0)}),Ke=X.filter(function(s){var T=String(s&&s.linkedDebtId||"").trim();return!T||we[T]!==!0}),j=E(K).getTime(),nt=Y(K).getTime(),_e=v(K,L.forecastDays).getTime(),Ee=Object.create(null),at=0,it=0;oe.forEach(function(s){var T=Number(s&&s.balance)||0,ce=V(s&&s.bucket),xe=ce!=="available"||!!(s&&s.reserved);at+=T,xe&&(it+=T,Ee[ce]||(Ee[ce]={bucket:ce,label:h(ce),amount:0}),Ee[ce].amount+=T)}),W.forEach(function(s){Ee[s]||(Ee[s]={bucket:s,label:h(s),amount:0})});var gt=Object.keys(Ee).map(function(s){return{bucket:s,label:Ee[s].label,amount:w(Ee[s].amount)}}).sort(function(s,T){var ce=W.indexOf(s.bucket),xe=W.indexOf(T.bucket);return ce!==xe?(ce===-1?999:ce)-(xe===-1?999:xe):String(s.label).localeCompare(String(T.label))}),m=Ke.filter(function(s){return String(s&&s.scope||"").toLowerCase()==="personal"||String(s&&s.scope||"").toLowerCase()==="shared"}).reduce(function(s,T){return s+(Number(T&&T.monthlyAmount)||0)},0),i=Ke.filter(function(s){return String(s&&s.scope||"").toLowerCase()==="business"||String(s&&s.scope||"").toLowerCase()==="shared"}).reduce(function(s,T){return s+(Number(T&&T.monthlyAmount)||0)},0);re.forEach(function(s){var T=Number(s&&s.minimumPaymentMonthly)||Number(s&&s.minimumPayment)||0,ce=String(s&&s.scope||"shared").toLowerCase();(ce==="personal"||ce==="shared")&&(m+=T),(ce==="business"||ce==="shared")&&(i+=T)});var I=Ke.reduce(function(s,T){return s+(Number(T&&T.monthlyAmount)||0)},0),ne=re.reduce(function(s,T){return s+(Number(T&&T.minimumPaymentMonthly)||Number(T&&T.minimumPayment)||0)},0),Me=I+ne,Se=[],ke=M(K),Je=ke?ke.split("-").map(Number):[],Xe=M(_e),se=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(ke,-30):M(v(K,-30));Ke.forEach(function(s){for(var T=Math.max(1,Math.min(28,Number(s&&s.dueDay)||1)),ce=0;ce<4;ce+=1){var xe=new Date(Date.UTC(Je[0]||new Date(K).getUTCFullYear(),(Je[1]||new Date(K).getUTCMonth()+1)-1+ce,T,12,0,0,0)),bt=e.FinanceDates&&e.FinanceDates.dateOnlyFromParts?e.FinanceDates.dateOnlyFromParts(xe.getUTCFullYear(),xe.getUTCMonth()+1,xe.getUTCDate()):xe.toISOString().slice(0,10);if(!(Xe&&bt>Xe)&&(ce>0||!se||bt>=se)){var cn=String(s&&s.id||"expense")+"-"+bt.slice(0,7),rt=Ce[cn]||null,Vt=bt,Gt=F(bt,K);rt&&rt.status==="paid"?Gt="paid":rt&&rt.status==="deferred"&&rt.deferredUntil?(Vt=M(rt.deferredUntil)||Vt,Gt=F(Vt,K)):rt&&rt.status==="needs_review"&&(Gt="needs_review"),Se.push({id:cn,sourceId:String(s&&s.id||"expense"),title:String(s&&s.category||"Recurring cost"),type:"recurring_cost",amount:w(Number(s&&s.monthlyAmount)||0),dueDate:Vt,originalDueDate:bt,status:Gt,review:rt,scope:String(s&&s.scope||"shared")})}}}),ue.forEach(function(s){var T=Number(s&&s.outstanding)||0;if(!(T<=0)){var ce=M(s&&s.dueDate),xe=(Number(s&&s.minimumPayment)||0)>0;Se.push({id:String(s&&s.id||"debt"),title:String(s&&s.name||"Debt repayment"),type:"debt",amount:w((Number(s&&s.minimumPayment)||0)>0?Number(s&&s.minimumPayment):T),dueDate:ce,status:xe?F(ce,K):"needs_review",scope:String(s&&s.scope||"shared")})}}),Se.sort(function(s,T){var ce=Date.parse(s.dueDate||"")||Number.MAX_SAFE_INTEGER,xe=Date.parse(T.dueDate||"")||Number.MAX_SAFE_INTEGER;return ce-xe});var Be=he.map(function(s){var T=k(s);return{id:String(s&&s.id||""),title:String(s&&s.title||"Income"),amount:w(Number(s&&s.value)||0),dueDate:M(s&&s.expectedDateISO),status:T,probability:t.clampProbability(s&&s.probability),scope:String(s&&s.scope||"shared")}}).filter(function(s){return s.status!=="received"&&s.status!=="cancelled"}),Ne={confirmed:0,expected:0,risky:0,received:0};Be.forEach(function(s){var T=Date.parse(s.dueDate||"");!Number.isFinite(T)||T<j||T>nt||(s.status==="confirmed"&&(Ne.confirmed+=s.amount),s.status==="expected"&&(Ne.expected+=s.amount),s.status==="risky"&&(Ne.risky+=s.amount))}),be.forEach(function(s){var T=Date.parse(s&&s.timestamp||"");!Number.isFinite(T)||T<j||T>nt||String(s&&s.type)==="income.received"&&(Ne.received+=Number(s&&s.amount)||0)});function Et(s){var T=Date.parse(s&&s.dueDate||"");return Number.isFinite(T)&&T>=K&&T<=_e}function ot(s,T){var ce=Date.parse(s&&s.dueDate||"");return Number.isFinite(ce)?ce>=K&&ce<=v(K,T).getTime():!1}var $t=Be.filter(Et),Dt=$t.filter(function(s){return s.status==="confirmed"}).reduce(function(s,T){return s+T.amount},0),kt=$t.filter(function(s){return s.status==="expected"}).reduce(function(s,T){return s+T.amount},0),zt=$t.filter(function(s){return s.status==="risky"}).reduce(function(s,T){return s+T.amount},0),Tt=Se.filter(function(s){return s.status!=="paid"}).reduce(function(s,T){return s+(Number(T.amount)||0)},0),tn=w(at-it);function Mt(s){Ze.push(Object.assign({kind:"setup",targetId:"",actionLabel:"Review",tone:"review"},s))}var Ze=[];Se.filter(function(s){return s.status==="overdue"||s.status==="due_soon"||s.status==="needs_review"||s.status==="deferred"}).slice(0,8).forEach(function(s){var T=String(s.type)==="debt";Ze.push({kind:T?"debt":"obligation",id:s.id,targetId:s.id,title:s.title,reason:T?"Debt needs a due date or payment plan":s.status==="overdue"?"Overdue obligation":s.status==="due_soon"?"Due within 7 days":"Needs an obligation decision",actionLabel:T?"Add plan":s.status==="overdue"?"Mark paid":"Review",tone:s.status==="overdue"?"urgent":"review"})}),be.filter(function(s){return String(s&&s.type)==="expense.recorded"&&!String(s&&s.obligationId||"").trim()&&String(s&&s.categoryId||"").toLowerCase()==="obligation"}).slice(0,4).forEach(function(s){Mt({kind:"payment",id:String(s&&s.id||""),targetId:String(s&&s.id||""),title:String(s&&s.description||"Payment"),reason:"Actual payment needs matching to an obligation",actionLabel:"Match",tone:"review"})}),be.filter(function(s){return String(s&&s.categoryId||"").toLowerCase()==="uncategorized"||String(s&&s.reviewStatus||"").toLowerCase()==="needs_review"}).slice(0,4).forEach(function(s){Mt({kind:"transaction",id:String(s&&s.id||""),targetId:String(s&&s.id||""),title:String(s&&s.description||"Transaction"),reason:"Uncategorized transaction",actionLabel:"Categorize",tone:"review"})}),Be.filter(function(s){var T=M(s&&s.dueDate);return s.status==="risky"||T&&T<ke}).slice(0,4).forEach(function(s){Ze.push({kind:"pipeline",id:s.id,targetId:s.id,title:s.title,reason:s.status==="risky"?"Risky income assumption":"Expected income is overdue",actionLabel:s.status==="risky"?"Update":"Received",tone:"review"})}),oe.length||Ze.unshift({kind:"setup",id:"missing-cash",targetId:"missing-cash",title:"Cash baseline",reason:"Add at least one cash account",actionLabel:"Add account",tone:"urgent"}),X.length||Mt({kind:"setup",id:"missing-burn",targetId:"missing-burn",title:"Monthly burn",reason:"Add recurring fixed costs",actionLabel:"Add recurring cost",tone:"review"});var pe=Ze.filter(function(s){return["obligation","payment","transaction","pipeline","debt","setup"].indexOf(String(s&&s.kind||""))!==-1}).slice(0,6),He=Be.filter(function(s){return ot(s,30)}),Le=Se.filter(function(s){return s.status!=="paid"&&ot(s,30)}),et=He.filter(function(s){return s.status==="confirmed"}).reduce(function(s,T){return s+(Number(T.amount)||0)},0),vt=He.filter(function(s){return s.status==="expected"}).reduce(function(s,T){return s+(Number(T.amount)||0)*t.clampProbability(T.probability)},0),We=Le.reduce(function(s,T){return s+(Number(T.amount)||0)},0),mt=w(at),je=w(it),Ye=w(We),_=w(mt-je-Ye),le=w(ue.reduce(function(s,T){return s+(Number(T&&T.outstanding)||0)},0)),pt={actualCash:C("actualCash","Actual cash",mt,[{label:"Active liquid account balances",value:mt,operation:"add"}]),protectedCash:C("protectedCash","Protected cash",je,gt.filter(function(s){return Number(s&&s.amount)>0}).map(function(s){return{label:String(s.label||"Reserve bucket"),value:Number(s.amount)||0,operation:"add"}})),availableCash:C("availableCash","Available cash",_,[{label:"Actual cash",value:mt,operation:"add"},{label:"This money is protected",value:je,operation:"subtract"},{label:"Due within 30 days",value:Ye,operation:"subtract"}]),monthlyBurnRate:C("monthlyBurnRate","Monthly burn rate",Me,[{label:"Recurring costs",value:I,operation:"add"},{label:"Debt payment plans",value:ne,operation:"add"}]),runway:C("runway","Runway",Me>0?w(_/Me):0,[{label:"Available cash",value:_,operation:"divide"},{label:"Monthly burn rate",value:Me,operation:"divide"}],Me>0?[]:["Runway is unavailable until monthly burn is known."]),debtBurden:C("debtBurden","Debt burden",le,ue.filter(function(s){return(Number(s&&s.outstanding)||0)>0}).map(function(s){return{label:String(s.name||"Debt"),value:Number(s.outstanding)||0,operation:"add"}}))};return{actualCash:mt,totalCash:mt,protectedCash:je,reservedCash:je,trulyAvailableCash:tn,availableCash:_,committedShortTermObligations:Ye,shortTermObligationWindowDays:30,reserveBuckets:gt,monthlyPersonalBurn:w(m),monthlyBusinessBurn:w(i),totalMonthlyBurn:w(Me),runwayMonths:Me>0?w(_/Me):null,explanations:pt,obligations:Se,overdueObligations:Se.filter(function(s){return s.status==="overdue"}),dueSoonObligations:Se.filter(function(s){return s.status==="due_soon"}),upcomingObligations:Se.filter(function(s){return s.status==="upcoming"}),paidObligations:Se.filter(function(s){return s.status==="paid"}),income:Be,incomeThisMonth:{confirmed:w(Ne.confirmed),expected:w(Ne.expected),risky:w(Ne.risky),received:w(Ne.received)},incomeScenarios:{conservative:w(_+Dt-Tt),expected:w(_+Dt+kt-Tt),optimistic:w(_+Dt+kt+zt-Tt)},dashboardSummary:{actionThisWeek:{count:Ze.length,urgentCount:Ze.filter(function(s){return s&&s.tone==="urgent"}).length,items:pe},next30Days:{confirmedIncoming:w(et),expectedWeightedIncoming:w(vt),obligationsDue:w(We),projectedNetMovement:w(et+vt-We),incomeCount:He.length,obligationCount:Le.length}},reviewQueue:Ze.slice(0,10),debtRemaining:w(ue.reduce(function(s,T){return s+(Number(T&&T.outstanding)||0)},0)),reserveGaps:gt.filter(function(s){return W.indexOf(s.bucket)!==-1&&Number(s.amount)<=0})}}function de(B,N){var L=d(N),K=t.sortFinancialEvents(l(B)),oe=n.getActiveEvents(K),X=n.buildReadModel(K,L),Ce=L.nowIso||new Date().toISOString(),be=Date.parse(Ce),fe=new Date(be);fe.setDate(fe.getDate()+L.forecastDays);var he=fe.getTime(),ue=0,we=0,re=0,Ke=!1,j=0,nt=t.localDateKey(Ce);oe.forEach(function(_){var le=Date.parse(_.timestamp),pt=t.toMinor(Math.abs(Number(_.amount)||0)),s=Number.isFinite(le)?le<=be:!1,T=Number.isFinite(le)?le>be&&le<=he:!1;if(_.type==="income.received"){s?ue+=t.toMinor(Number(_.amount)||0):T&&(j+=t.toMinor(Number(_.amount)||0)),s&&nt&&t.localDateKey(_.timestamp)===nt&&(we+=t.toMinor(Number(_.amount)||0));return}if(_.type==="expense.recorded"){Ke=!0,s&&(ue-=pt),u(_.timestamp,be,30)&&(re+=pt);return}_.type!=="debt.added"&&_.type!=="debt.payment_made"&&_.type==="balance.opening_set"&&s&&(ue+=t.toMinor(Number(_.amount)||0))});var _e=l(X.fiatAccounts),Ee=l(X.web3Positions),at=l(X.defiPositions),it=t.toMinor(_e.reduce(function(_,le){return _+(Number(le&&le.balance)||0)},0)),gt=t.toMinor(Ee.reduce(function(_,le){return _+(Number(le&&le.amount)||0)*(Number(le&&le.price)||0)},0)),m=t.toMinor(at.reduce(function(_,le){return _+((Number(le&&le.collateralValue)||0)-(Number(le&&le.debtValue)||0))},0)),i=it+gt+m,I=_e.length>0||Ee.length>0||at.length>0,ne=_e.length>0?it:I?i:ue,Me=0,Se=0,ke=R(X.transactions);l(X.pipelineDeals).forEach(function(_){if(b(_.status)&&ke[String(_&&_.id||"")]!==!0){var le=t.clampProbability(_.probability),pt=t.toMinor(A(_.value,0)*le);Me+=pt,y(_.expectedDateISO,be,he)&&(Se+=pt)}});var Je=t.toMinor(X.recurringMonthlyTotal||0),Xe=t.toMinor(l(X.activeRecurringExpenses).filter(function(_){return _.essential}).reduce(function(_,le){return _+(Number(le.monthlyAmount)||0)},0)),se=Xe,Be=Je,Ne=null;(X.recurringExpenses||[]).length>0?Ne=Je:re>0?Ne=re:Ke&&(Ne=0);var Et=Je>0?Math.round(Je*(L.forecastDays/30)):0,ot=ne+Se+j-Et,$t=t.toMinor(X.debtTotal||0),Dt=t.toMinor(l(X.reserveBuckets).reduce(function(_,le){return _+(Number(le.currentAmount)||0)},0)),kt=Math.max(0,ne-Dt),zt=Ne==null?null:t.fromMinor(Ne),Tt=t.fromMinor(se),tn=t.fromMinor(Be),Mt=null;Ne!=null&&Ne>0&&(Mt=w(t.fromMinor(kt)/t.fromMinor(Ne)));var Ze=zt,pe=te(X,{},L,be),He=[];l(X.transactions).forEach(function(_){(_.reviewStatus==="needs_review"||_.categoryId==="uncategorized")&&He.push({type:"Needs review",title:_.description,amount:_.amount,action:"Review",id:_.id,original:_})}),l(X.invoices).forEach(function(_){if(_.status!=="Paid"&&_.expectedDate){var le=Date.parse(_.expectedDate);Number.isFinite(le)&&le<be&&He.push({type:"Overdue",title:_.client+" invoice",amount:_.amount,action:"Mark paid",id:_.id,original:_})}}),l(pe.upcomingObligations).concat(l(pe.overdueObligations)).forEach(function(_){He.push({type:"Due soon",title:_.title,amount:_.amount,action:"Review",id:_.id,original:_})}),l(X.debtAccounts).forEach(function(_){_.outstanding>0&&!_.dueDate&&!_.minimumPayment&&He.push({type:"Missing plan",title:_.name,amount:_.outstanding,action:"Add plan",id:_.id,original:_})}),l(X.pipelineDeals).filter(function(_){return n.isPipelineActive(_.status)}).length===0&&He.push({type:"Missing forecast input",title:"Income pipeline",amount:null,action:"Add income",id:"pipeline-missing"}),l(X.reserveBuckets).length===0&&He.push({type:"Missing plan",title:"Reserve buckets",amount:null,action:"Create reserve",id:"reserves-missing"});var Le={realBalance:t.fromMinor(ne),projectedBalance:t.fromMinor(ot),attentionQueue:He,trulyAvailable:t.fromMinor(kt),reserveTotal:t.fromMinor(Dt),survivalBurn:Tt,comfortBurn:tn,weightedPipeline:t.fromMinor(Me),monthlyBurn:zt,runwayMonths:Mt,breakEvenRevenue:Ze,revenueToday:t.fromMinor(we),totalDebt:t.fromMinor($t),confidenceScore:1,missingInputs:[],lastComputedAt:Ce,totalCash:pe.totalCash,actualCash:pe.actualCash,reservedCash:pe.reservedCash,protectedCash:pe.protectedCash,trulyAvailableCash:pe.trulyAvailableCash,availableCash:pe.availableCash,committedShortTermObligations:pe.committedShortTermObligations,monthlyPersonalBurn:pe.monthlyPersonalBurn,monthlyBusinessBurn:pe.monthlyBusinessBurn,totalMonthlyBurn:pe.totalMonthlyBurn,availableRunwayMonths:pe.runwayMonths,confirmedIncomeThisMonth:pe.incomeThisMonth.confirmed,expectedIncomeThisMonth:pe.incomeThisMonth.expected,riskyIncomeThisMonth:pe.incomeThisMonth.risky,debtRemaining:pe.debtRemaining};pe.totalMonthlyBurn>0&&(Le.monthlyBurn=pe.totalMonthlyBurn,Le.runwayMonths=pe.runwayMonths,Le.breakEvenRevenue=pe.totalMonthlyBurn);var et=[];(X.recurringExpenses||[]).length===0&&et.push("recurring expenses"),(oe.length===0||!oe.some(function(_){return u(_.timestamp,be,30)}))&&et.push("recent financial activity"),Le.monthlyBurn==null&&et.push("monthly burn"),(X.pipelineDeals||[]).filter(function(_){return b(_.status)}).length===0&&et.push("pipeline");var vt=oe.length?Date.parse(oe[oe.length-1].timestamp):0,We=vt>0?be-vt>1080*60*60*1e3:!0,mt={realBalanceFromSums:t.fromMinor(ne),weightedPipelineFromDeals:t.fromMinor(Me),totalDebtFromLiabilities:t.fromMinor($t)},je=a.evaluateFinancialInvariants({snapshot:Le,components:mt}),Ye=o.computeConfidenceScore({missingRecurringExpenses:(X.recurringExpenses||[]).length===0,noRecentData:et.indexOf("recent financial activity")!==-1,undefinedBurn:Le.monthlyBurn==null,emptyPipeline:et.indexOf("pipeline")!==-1,staleCompute:We,missingInputs:et.concat(je.messages||[]),invariantViolations:je.violations});return Le.confidenceScore=Ye.score,Le.missingInputs=Ye.missingInputs,je.violations.length>0&&e.console&&typeof e.console.warn=="function"&&e.console.warn("[FinanceInvariant] violation(s)",je.violations),{snapshot:Le,readModel:X,treasury:pe,explanations:Object.assign({},pe.explanations,{forecastConfidence:C("forecastConfidence","Forecast confidence",Math.round((Number(Ye.score)||0)*100),[{label:"Confidence score",value:Math.round((Number(Ye.score)||0)*100),operation:"add"}],Ye.reasons||Ye.missingInputs||[])}),invariants:je,confidence:Ye,diagnostics:{staleCompute:We,latestEventTimestamp:vt?new Date(vt).toISOString():null,forecastDays:L.forecastDays,baseCurrency:L.baseCurrency,invariantMessages:je.messages||[],forecastFutureIncome:t.fromMinor(j),realBalanceFromEvents:t.fromMinor(ue),realBalanceFromFiatAccounts:t.fromMinor(it),realBalanceFromAssets:t.fromMinor(i),realBalanceUsesFiatAnchor:_e.length>0,realBalanceUsesAssetAnchor:I}}}function ve(B,N){return de(B,N).snapshot}var J={normalizeSettings:d,computeFinancialContext:de,computeFinancialState:ve};typeof module<"u"&&module.exports&&(module.exports=J),e.FinanceCompute=J})(typeof window<"u"?window:globalThis);function Kn(e,t="EUR"){const n=String(e||"").trim().toUpperCase();return n||String(t||"").trim().toUpperCase()||"EUR"}function ma(e,t={}){const n=Number(e);if(!Number.isFinite(n))return"—";const a=Kn(t.currency,t.baseCurrency);return new Intl.NumberFormat(t.locale,{style:"currency",currency:a,minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceCompute;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./compute.js")),!t||!n||!a)throw new Error("Finance modal event utilities require events/ledger/compute modules.");function o(v){if(!t.isIsoTimestamp(v))throw new Error("Timestamp is required and must be ISO-8601.");return new Date(v).toISOString()}function d(v){var M=Number(v);if(!Number.isFinite(M))throw new Error("Amount must be a finite number.");return M}function l(v){var M=Number(v);return Number.isFinite(M)&&M>=0&&M<=1}function u(v){if(!l(v))throw new Error("Probability must be in range 0..1.");return Number(v)}function y(v){return n.normalizeSettings(v||{})}function b(v,M){var E=v&&typeof v=="object"?v:{},Y=y(M),k=Math.abs(d(E.amount)),F=o(E.timestamp),C=u(E.probability),R=String(E.id||E.related_entity_id||"pipe-"+Date.now()),te=String(E.status||"open").trim().toLowerCase()||"open";return{type:"pipeline.created",amount:k,currency:t.normalizeCurrency(E.currency,Y.baseCurrency),timestamp:F,related_entity_id:R,metadata:{title:String(E.title||"Pipeline Item"),value:k,probability:C,status:te,stage:te,expectedDateISO:String(E.expectedDateISO||F.slice(0,10))}}}function A(v,M){var E=v&&typeof v=="object"?v:{},Y=y(M),k=Math.abs(d(E.monthlyAmount!=null?E.monthlyAmount:E.amount));return{type:"expense.recurring_set",amount:k,currency:t.normalizeCurrency(E.currency,Y.baseCurrency),timestamp:o(E.timestamp),related_entity_id:String(E.id||E.related_entity_id||"expense-"+Date.now()),metadata:{category:String(E.category||"Recurring Expense"),monthlyAmount:k,essential:!!E.essential,active:E.active!==!1}}}function w(v,M){var E=v&&typeof v=="object"?v:{},Y=y(M),k=d(E.amount),F=E.type;if(F||(F=k>=0?"income.received":"expense.recorded"),F!=="income.received"&&F!=="expense.recorded")throw new Error("Unsupported transaction draft type: "+F);return{type:F,amount:Math.abs(k),currency:t.normalizeCurrency(E.currency,Y.baseCurrency),timestamp:o(E.timestamp),related_entity_id:E.related_entity_id?String(E.related_entity_id):void 0,metadata:E.metadata&&typeof E.metadata=="object"?t.deepClone(E.metadata):{}}}function W(v,M,E){var Y=y(E),k=t.isIsoTimestamp(Y.nowIso)?Y.nowIso:new Date().toISOString(),F=n.appendEvents(v||[],M||[],Y,{nowIso:k,allowApproximateTimestamp:!1});return{snapshot:a.computeFinancialState(F.events,{baseCurrency:Y.baseCurrency,forecastDays:Y.forecastDays,nowIso:k}),events:F.events,appended:F.appended}}function V(v){return Array.isArray(v)?v.slice():[]}var h={requireTimestamp:o,requireAmount:d,validateProbability:l,requireProbability:u,buildPipelineCreateDraft:b,buildRecurringExpenseDraft:A,buildIncomeOrExpenseDraft:w,previewSnapshot:W,cancelWithoutMutation:V};typeof module<"u"&&module.exports&&(module.exports=h),e.FinanceModalEvents=h})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,a=e.FinanceCompute,o=e.FinanceModalEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!a&&typeof module<"u"&&module.exports&&(a=require("./compute.js")),!o&&typeof module<"u"&&module.exports&&(o=require("./modal-events.js")),!t||!n||!a)throw new Error("FinanceCommandService dependencies are missing.");function d(w){return n.normalizeSettings(w||{})}function l(w){return Array.isArray(w)?w:[]}function u(w,W,V){if(!w||typeof w.getFinanceLedger!="function"||typeof w.getFinanceSettings!="function")return null;var h=l(W).filter(Boolean);if(!h.length)return null;var v=w.getFinanceSettings()||{},M=d({baseCurrency:V&&V.baseCurrency||v.baseCurrency,forecastDays:V&&V.forecastDays||v.forecastDays,nowIso:V&&V.nowIso||new Date().toISOString()}),E=w.getFinanceLedger();if(o&&typeof o.previewSnapshot=="function")return o.previewSnapshot(E,h,M).snapshot;var Y=n.appendEvents(E,h,M,{nowIso:M.nowIso,allowApproximateTimestamp:!1});return a.computeFinancialState(Y.events,M)}function y(w,W,V){if(!w||typeof w.appendFinanceEvents!="function")throw new Error("Store.appendFinanceEvents is unavailable.");var h=l(W).filter(Boolean);if(!h.length)return[];var v=V||{};return w.appendFinanceEvents(h,{source:v.source||"finance.command"})}function b(w){return!w||typeof w.getFinanceLedger!="function"||!n||typeof n.getActiveEvents!="function"?[]:n.getActiveEvents(w.getFinanceLedger())}var A={normalizeSettings:d,previewFromDrafts:u,appendDrafts:y,getActiveEvents:b};e.FinanceCommandService=A})(typeof window<"u"?window:globalThis);window.FinancialEngine=(function(){const e={LOW:"Low",MEDIUM:"Medium",HIGH:"High"};function t(h,v){const M=Number(h);return Number.isFinite(M)?M:Number.isFinite(Number(v))?Number(v):0}function n(h,v,M){const E=t(h,v);return Math.min(M,Math.max(v,E))}function a(h){const v=h&&typeof h=="object"?h:{},M=v.monthlyBurn==null?null:t(v.monthlyBurn,0),E=v.runwayMonths==null?null:t(v.runwayMonths,null);return{realBalance:t(v.realBalance,0),projectedBalance:t(v.projectedBalance,0),weightedPipeline:t(v.weightedPipeline,0),monthlyBurn:M,runwayMonths:E,breakEvenRevenue:v.breakEvenRevenue==null?M:t(v.breakEvenRevenue,M),revenueToday:t(v.revenueToday,0),totalDebt:t(v.totalDebt,0),confidenceScore:Math.max(0,Math.min(1,t(v.confidenceScore,0))),missingInputs:Array.isArray(v.missingInputs)?v.missingInputs.slice():[],lastComputedAt:v.lastComputedAt||new Date().toISOString()}}function o(){return{pipelineDeals:[],recurringExpenses:[],debtAccounts:[],invoices:[],fiatAccounts:[],web3Positions:[],defiPositions:[],expectedPipeline90d:0}}function d(){return!window.Store||typeof window.Store.getFinancialSnapshot!="function"?null:a(window.Store.getFinancialSnapshot())}function l(){if(!window.Store||typeof window.Store.getFinancialReadModel!="function")return o();const h=window.Store.getFinancialReadModel();return h&&typeof h=="object"?h:o()}function u(h){const v=h&&typeof h=="object"?h:{},M=Array.isArray(v.expenses)?v.expenses:[],E=Array.isArray(v.debt)?v.debt:[],Y=Array.isArray(v.income)?v.income:[],k=Array.isArray(v.fiatAccounts)?v.fiatAccounts:[],F=Array.isArray(v.savings)?v.savings:[],C=M.reduce((N,L)=>N+t(L&&L.monthlyAmount,0),0),R=E.reduce((N,L)=>N+t(L&&(L.monthlyPayment??L.minimumPaymentMonthly),0),0),te=C+R,de=k.reduce((N,L)=>N+t(L&&L.balance,0),0)+F.reduce((N,L)=>N+t(L&&L.amount,0),0),ve=Y.filter(N=>String(N&&N.status||"").toLowerCase()!=="paid").reduce((N,L)=>N+t(L&&L.amount,0)*t(L&&L.probability,0),0),J=E.reduce((N,L)=>N+t(L&&L.total,0),0),B=te>0?de/te:null;return{realBalance:de,projectedBalance:de+ve,weightedPipeline:ve,monthlyBurn:te,runwayMonths:B,breakEvenRevenue:te,revenueToday:0,totalDebt:J,confidenceScore:.4,missingInputs:["legacy finance model"],lastComputedAt:new Date().toISOString()}}function y(h){if(h&&typeof h=="object"&&h.financeSnapshot)return{snapshot:a(h.financeSnapshot),readModel:h.financeReadModel&&typeof h.financeReadModel=="object"?h.financeReadModel:o()};if(h&&typeof h=="object"&&h.realBalance!=null&&h.weightedPipeline!=null)return{snapshot:a(h),readModel:o()};const v=d();return v?{snapshot:v,readModel:l()}:{snapshot:a(u(h)),readModel:o()}}function b(h){const v=(Array.isArray(h.fiatAccounts)?h.fiatAccounts:[]).reduce((k,F)=>k+t(F&&F.balance,0),0);let M=0,E=0,Y=0;return(Array.isArray(h.web3Positions)?h.web3Positions:[]).forEach(k=>{const F=t(k&&k.amount,0)*t(k&&k.price,0),C=String(k&&k.liquidity||"").toLowerCase();C==="low"?E+=F:C==="med"||C==="medium"?M+=F:Y+=F}),{safe:v+Y,growth:M,speculative:E}}function A(h){const v=y(h),M=v.snapshot,E=v.readModel||o(),Y=b(E),k=M.runwayMonths;let F=e.LOW;k==null||k<4?F=e.HIGH:k<6&&(F=e.MEDIUM);const C=k==null?0:Math.min(100,Math.max(0,k/12*100)),R=Math.round(M.confidenceScore*100),te=M.totalDebt>Math.max(1,M.realBalance)?18:0,de=Math.max(0,Math.min(100,Math.round(C*.6+R*.4-te))),ve=M.monthlyBurn==null?0:M.monthlyBurn,J=t(E.expectedPipeline90d,M.weightedPipeline),B=Date.parse(String(h&&h.nowIso||""))||Date.now(),N=B+2160*60*60*1e3,L=(Array.isArray(E.invoices)?E.invoices:[]).filter(fe=>String(fe&&fe.status||"").toLowerCase()==="paid").filter(fe=>{const he=Date.parse(String(fe&&fe.paidAt||fe&&fe.sentAt||fe&&fe.expectedDateISO||fe&&fe.timestamp||""));return Number.isFinite(he)&&he>=B&&he<=N}).reduce((fe,he)=>fe+t(he&&he.amount,0),0),K=M.realBalance,oe=M.projectedBalance,X=M.totalDebt,Ce=Y.growth+Y.speculative;return{fiatTotal:Y.safe,savingsTotal:0,debtTotalRemaining:X,web3Total:Ce,totalNetWorth:oe,liquidNetWorth:K,monthlyBurn:ve,survivalBurn:ve,runwayMonths:M.runwayMonths,survivalRunwayMonths:M.runwayMonths,confirmedIncome90d:L,weightedIncome90d:J,stressLevel:F,safetyScore:de,allocation:Y,confidenceScore:M.confidenceScore,missingInputs:M.missingInputs,computedAt:M.lastComputedAt}}function w(h,v={}){const M=y(h),E=A(h),Y=M.readModel||o(),k=12,F={safe:[],realistic:[],optimistic:[]},C=Array.isArray(Y.pipelineDeals)?Y.pipelineDeals:[];let R=t(M.snapshot.realBalance,0),te=t(M.snapshot.realBalance,0),de=t(M.snapshot.realBalance,0);const ve=n(t(v.probFloor,50)/100,0,1),J=n(t(v.marketShift,0),-1,1);for(let B=0;B<k;B++){const N=new Date;N.setMonth(N.getMonth()+B);const L=new Date(N.getFullYear(),N.getMonth(),1),K=new Date(N.getFullYear(),N.getMonth()+1,0),oe=C.filter(ue=>{const we=new Date(ue.expectedDateISO||"");return we>=L&&we<=K}),X=ue=>n(Math.max(t(ue,0),ve)*(1+J),0,1),Ce=oe.filter(ue=>String(ue.status||"").toLowerCase()==="signed"||String(ue.status||"").toLowerCase()==="paid").reduce((ue,we)=>ue+t(we.value,0),0),be=oe.reduce((ue,we)=>ue+t(we.value,0)*X(we.probability),0),fe=oe.reduce((ue,we)=>ue+t(we.value,0)*n(X(we.probability)+.2,0,1),0),he=t(E.monthlyBurn,0)*(1+(v.burnChange||0));R=R+Ce-he,te=te+be-he,de=de+fe-he,F.safe.push(Math.max(0,R)),F.realistic.push(Math.max(0,te)),F.optimistic.push(Math.max(0,de))}return F}function W(h){if(!h)return null;const v=h.runwayMonths;return{RUNWAY_STATUS:v==null?"unknown":v>=6?"safe":v>=4?"thin":"critical",STRESS_LEVEL:String(h.stressLevel||e.HIGH).toLowerCase(),STABILITY_SCORE:t(h.safetyScore,0),URGENCY_FLAG:v==null||v<4,CONFIDENCE_SCORE:t(h.confidenceScore,0),MISSING_INPUTS:Array.isArray(h.missingInputs)?h.missingInputs.slice():[]}}function V(){if(!window.Store||typeof window.Store.getFinancialSnapshot!="function")return null;const h=A({financeSnapshot:window.Store.getFinancialSnapshot(),financeReadModel:typeof window.Store.getFinancialReadModel=="function"?window.Store.getFinancialReadModel():o()});return W(h)}return{compute:A,generateProjections:w,getSignals:W,getSignalsFromStore:V,STRESS_LEVELS:e}})();function pa(e,t=12){const n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}function Rn(e){const t=new Date;return t.setUTCDate(t.getUTCDate()+e),`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,"0")}-${String(t.getUTCDate()).padStart(2,"0")}`}function fa(e){const t=n=>pa(n);return[{type:"asset.account_set",amount:10400,currency:e,timestamp:t(-28),related_entity_id:"cash-operating",metadata:{name:"Operating cash",balance:10400,active:!0,scope:"business",bucket:"available"}},{type:"asset.account_set",amount:6200,currency:e,timestamp:t(-27),related_entity_id:"reserve-tax",metadata:{name:"Tax reserve",balance:6200,active:!0,scope:"business",bucket:"tax_reserve",reserved:!0}},{type:"asset.account_set",amount:2800,currency:e,timestamp:t(-26),related_entity_id:"reserve-vat",metadata:{name:"VAT reserve",balance:2800,active:!0,scope:"business",bucket:"vat_reserve",reserved:!0}},{type:"asset.account_set",amount:1800,currency:e,timestamp:t(-25),related_entity_id:"reserve-health",metadata:{name:"Health insurance reserve",balance:1800,active:!0,scope:"personal",bucket:"health_insurance",reserved:!0}},{type:"asset.account_set",amount:3e3,currency:e,timestamp:t(-24),related_entity_id:"reserve-buffer",metadata:{name:"Studio buffer",balance:3e3,active:!0,scope:"shared",bucket:"buffer",reserved:!0}},...[["Housing",1450,!0],["Studio & tools",420,!0],["Living",1120,!0],["Subscriptions",260,!1],["Flexible buffer",450,!1]].map(([n,a,o],d)=>({type:"expense.recurring_set",amount:Number(a),currency:e,timestamp:t(-16+d),related_entity_id:`expense-${d+1}`,metadata:{category:n,monthlyAmount:a,essential:o,active:!0,dueDay:1+d*4,frequency:"monthly",scope:d<2?"business":"personal"}})),{type:"debt.added",amount:6400,currency:e,timestamp:t(-90),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},{type:"debt.payment_made",amount:1e3,currency:e,timestamp:t(-15),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},...[["Editorial system",2600,-72],["Advisory sprint",1750,-39],["Research direction",3200,-13]].flatMap(([n,a,o],d)=>{const l=`settled-${d+1}`,u=t(Number(o));return[{type:"invoice.paid",amount:Number(a),currency:e,timestamp:u,related_entity_id:l,metadata:{client:n,amount:a,expectedDate:Rn(Number(o)),destinationAccountId:"cash-operating",scope:"business"}},{type:"income.received",amount:Number(a),currency:e,timestamp:u,related_entity_id:l,metadata:{description:`Invoice paid: ${n}`,invoiceId:l,accountId:"cash-operating",accountName:"Operating Cash",categoryId:"client-income",scope:"business",source:"demo"}}]}),...[["Product strategy retainer",4200,.9,18,"confirmed"],["Design systems advisory",2900,.65,37,"expected"],["Research collaboration",5600,.35,64,"risky"]].map(([n,a,o,d,l],u)=>({type:"pipeline.created",amount:Number(a),currency:e,timestamp:t(-6+u),related_entity_id:`pipeline-${u+1}`,metadata:{title:n,value:a,probability:o,status:l,stage:l,expectedDateISO:Rn(Number(d)),destinationAccountId:"cash-operating",destinationAccountName:"Operating Cash",scope:"business"}})),{type:"expense.recorded",amount:180,currency:e,timestamp:t(-5),related_entity_id:"transaction-research-tools",metadata:{description:"Research tools",accountId:"cash-operating",accountName:"Operating Cash",categoryId:"tools",scope:"business",source:"demo"}}]}const G=Object.freeze({ledger:"finance-master.ledger.v1",settings:"finance-master.settings.v1",ui:"finance-master.ui.v1",review:"finance-master.review.v1",goals:"finance-master.goals.v1",imports:"finance-master.imports.v1",priceCache:"finance-master.prices.v1",backupMeta:"finance-master.backup-meta.v1",focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",collapsedPrefix:"finance-master.layout.collapsed.",heroDetails:"finance-master.layout.hero-details",demoSeed:"finance-master.demo-seeded.v1"}),_n=Object.freeze(Object.values(G)),In="Finance Master",$n=2,ga=[1,2],jt="finance-master.local-first.v1";function va(e){try{return JSON.parse(e)}catch{return e}}function ba(e,t){return e!==void 0?{source:"indexeddb",value:e,removeLegacy:!1}:t==null?{source:"empty",value:void 0,removeLegacy:!1}:{source:"localStorage",value:va(t),removeLegacy:!0}}const ha="finance-master",ya=1,Ft="state",rn=new Map;let Ut=null;function gn(e){return JSON.parse(JSON.stringify(e))}function wa(e){return typeof e=="string"?e:JSON.stringify(e)}function Sa(e){try{return window.localStorage.getItem(e)}catch{return null}}function Jn(e,t){try{window.localStorage.setItem(e,wa(t))}catch{}}function Aa(e){try{window.localStorage.removeItem(e)}catch{}}function xn(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}function Ia(){return"indexedDB"in window?new Promise(e=>{const t=indexedDB.open(ha,ya);t.onupgradeneeded=()=>{t.result.objectStoreNames.contains(Ft)||t.result.createObjectStore(Ft)},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}):Promise.resolve(null)}async function $a(e){if(!Ut)return;const t=Ut.transaction(Ft,"readonly");return xn(t.objectStore(Ft).get(e))}async function Xn(e,t){if(Jn(e,t),!Ut)return;const n=Ut.transaction(Ft,"readwrite");await xn(n.objectStore(Ft).put(gn(t),e))}async function Da(e){if(Aa(e),!Ut)return;const t=Ut.transaction(Ft,"readwrite");await xn(t.objectStore(Ft).delete(e))}async function Ma(e){Ut=await Ia(),await Promise.all(e.map(async t=>{const n=await $a(t),a=Sa(t),o=ba(n,a);if(o.source!=="empty"){if(rn.set(t,gn(o.value)),o.source==="indexeddb"){Jn(t,o.value);return}await Xn(t,o.value)}}))}function Cn(e,t){return gn(rn.has(e)?rn.get(e):t)}function Kt(e,t){rn.set(e,gn(t)),Xn(e,t)}function ln(e){rn.delete(e),Da(e)}function Ht(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Na(e){return typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function Wt(e,t,n,a="error"){return{key:e,label:t,message:n,severity:a}}function Zn(e={}){const t=e.indexedDbAvailable===!0,n=e.localStorageAvailable===!0,a=e.quotaAvailable===!0,o=Number.isFinite(Number(e.quotaUsage))?Number(e.quotaUsage):null,d=Number.isFinite(Number(e.quotaLimit))?Number(e.quotaLimit):null,l=t!==!0||n!==!0||a!==!0;return{storageStatus:!t&&!n?"unavailable":l?"limited":"healthy",indexedDbAvailable:t,localStorageAvailable:n,quotaAvailable:a,quotaUsage:o,quotaLimit:d,privateModeWarning:l}}async function xa(e=globalThis){var t=!1;try{var n=e&&e.localStorage;if(n){var a="finance-master.storage-check";n.setItem(a,"ok"),n.removeItem(a),t=!0}}catch{t=!1}var o=!1,d=null,l=null;try{var u=await e?.navigator?.storage?.estimate?.();u&&Number.isFinite(Number(u.quota))&&(o=!0,d=Number.isFinite(Number(u.usage))?Number(u.usage):0,l=Number(u.quota))}catch{o=!1}return Zn({indexedDbAvailable:!!(e&&"indexedDB"in e),localStorageAvailable:t,quotaAvailable:o,quotaUsage:d,quotaLimit:l})}function Fn(e){if(!Array.isArray(e))return null;const t=e.reduce((n,a)=>{const o=Date.parse(String(a?.timestamp||a?.created_at||""));return Number.isFinite(o)?Math.max(n,o):n},0);return t>0?new Date(t).toISOString():null}function ea(e,t,n){const a=Array.isArray(e?.ledger)?e.ledger:[];return{appName:n,schemaLabel:t,backupVersion:e?.version,exportedAt:e?.exportedAt,eventCount:a.length,latestLocalEventAt:Fn(a)}}function Ca(e){const t=[],n=e.ledger;n.present&&!Array.isArray(n.value)&&t.push(Wt("ledger","Ledger events","Stored ledger data is not a list of finance events.")),Array.isArray(n.value)&&n.value.forEach((d,l)=>{(!Ht(d)||!String(d.id||"").trim()||!String(d.type||"").trim()||!Number.isFinite(Number(d.amount))||!Na(d.timestamp))&&t.push(Wt("ledger","Ledger events",`Ledger event ${l+1} is incomplete.`))}),[["settings","Finance settings"],["ui","UI settings"],["review","Review state"],["goals","Goals"],["imports","CSV import history"],["priceCache","Cached prices"]].forEach(([d,l])=>{e[d]?.present&&!Ht(e[d].value)&&t.push(Wt(d,l,`${l} is stored in an unreadable shape.`))}),e.imports?.present&&Ht(e.imports.value)&&!Array.isArray(e.imports.value.batches)&&t.push(Wt("imports","CSV import history","CSV import history is missing its batch list.")),e.goals?.present&&Ht(e.goals.value)&&!Array.isArray(e.goals.value.goals)&&t.push(Wt("goals","Goals","Goals data is missing its goal list.")),e.priceCache?.present&&Ht(e.priceCache.value)&&!Ht(e.priceCache.value.quotes)&&t.push(Wt("priceCache","Cached prices","Cached price data is missing its quote map."));const a=Fn(Array.isArray(n.value)?n.value:[]),o=Array.isArray(n.value)?n.value.length:0;return{ok:t.every(d=>d.severity!=="error"),issues:t,eventCount:o,latestEventAt:a,checkedAt:new Date().toISOString()}}function Fa(e){return JSON.parse(JSON.stringify(e))}function Pn(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}const Ea=Object.freeze([{schemaLabel:jt,migrate(e){return Fa(e)}}]);function Bn(e){const t=[];return Pn(e)?(Object.prototype.hasOwnProperty.call(e,"ledger")&&e.ledger!==void 0&&!Array.isArray(e.ledger)&&t.push("Ledger events must be stored as a list."),["settings","ui","review","goals","imports","priceCache"].forEach(n=>{Object.prototype.hasOwnProperty.call(e,n)&&e[n]!==void 0&&!Pn(e[n])&&t.push(`${n} must be stored as an object.`)}),{valid:t.length===0,errors:t}):{valid:!1,errors:["Repository snapshot must be an object."]}}function ka(e,t=jt){const n=Bn(e);if(!n.valid)return{status:"failed",safeToMigrate:!1,errors:n.errors};const a=Ea.find(l=>l.schemaLabel===t);if(!a)return{status:"pending",safeToMigrate:!1,errors:[]};const o=a.migrate(e),d=Bn(o);return{status:d.valid?"current":"failed",safeToMigrate:d.valid,errors:d.errors}}class Ta{id="manual";async getQuotes(t,n){return[]}}const Ln={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",USDC:"usd-coin"},Oa=8e3;class Ra{id="coingecko";async getQuotes(t,n){const a=n.toLowerCase(),o=[...new Set(t.map(b=>Ln[b.toUpperCase()]).filter(Boolean))];if(!o.length)return[];const d=new AbortController,l=globalThis.setTimeout(()=>d.abort(),Oa);let u;try{const b=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(o.join(","))}&vs_currencies=${encodeURIComponent(a)}`,{signal:d.signal});if(!b.ok)throw new Error("CoinGecko price refresh is temporarily unavailable.");u=await b.json()}catch(b){throw b instanceof DOMException&&b.name==="AbortError"?new Error("CoinGecko price refresh timed out."):b instanceof Error?b:new Error("CoinGecko price refresh failed.")}finally{globalThis.clearTimeout(l)}const y=new Date().toISOString();return t.flatMap(b=>{const A=Ln[b.toUpperCase()],w=Number(u[A]?.[a]);return Number.isFinite(w)?[{symbol:b.toUpperCase(),currency:n.toUpperCase(),price:w,source:this.id,quotedAt:y}]:[]})}}function _a(e){return e==="coingecko"?new Ra:new Ta}function Fe(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function At(e,t=!1){return t&&e===null?!0:typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function ta(e,t=!1){return["personal","business","shared"].includes(e)||t&&e==="all"}function Pa(e,t){if(!Array.isArray(e)){t.push("Ledger events are missing.");return}e.forEach((n,a)=>{(!Fe(n)||!String(n.id||"").trim()||!String(n.type||"").trim()||!Number.isFinite(Number(n.amount))||!String(n.currency||"").trim()||!At(n.timestamp)||!At(n.created_at)||!Fe(n.metadata))&&t.push(`Ledger event ${a+1} is incomplete.`)})}function Ba(e,t){(!Fe(e.financeSettings)||!String(e.financeSettings.baseCurrency||"").trim()||!Number.isFinite(Number(e.financeSettings.forecastDays)))&&t.push("Finance settings are incomplete.");const n=e.uiSettings;(!Fe(n)||!["aurora","midnight","bright"].includes(n.appearance)||typeof n.reducedMotion!="boolean"||!ta(n.scopeFilter,!0)||!["manual","coingecko"].includes(n.walletPriceSource)||!Fe(n.scenario)||!["marketMajors","burnDelta","probFloor"].every(a=>Number.isFinite(Number(n.scenario[a]))))&&t.push("UI settings are incomplete.")}function La(e,t,n){if(!Fe(e)||!At(e.lastReviewedAt,!0)){t.push("Weekly review state is incomplete.");return}n===2&&(!Fe(e.accountReconciliations)||!Fe(e.checklist)||typeof e.checklist.recurringCosts!="boolean"||typeof e.checklist.pipeline!="boolean"||typeof e.checklist.signals!="boolean"||typeof e.notes!="string"||Object.values(e.accountReconciliations).some(a=>!Fe(a)||!String(a.accountId||"").trim()||!Number.isFinite(Number(a.balance))||!At(a.reviewedAt)))&&t.push("Weekly review ritual state is incomplete.")}function ja(e,t,n){n!==1&&(!Fe(e)||!Array.isArray(e.goals)||e.goals.some(a=>!Fe(a)||!String(a.id||"").trim()||!String(a.name||"").trim()||!["savings","buffer"].includes(a.type)||!Number.isFinite(Number(a.targetAmount))||Number(a.targetAmount)<=0||!ta(a.scope)||!Array.isArray(a.linkedAccountIds)||a.targetDate!==void 0&&!/^\d{4}-\d{2}-\d{2}$/.test(String(a.targetDate))||!At(a.createdAt)||!At(a.updatedAt)))&&t.push("Savings and buffer goals are incomplete.")}function Ua(e,t,n){La(e.review,t,n),ja(e.goals,t,n),(!Fe(e.imports)||!Array.isArray(e.imports.batches)||e.imports.batches.some(a=>!Fe(a)||!String(a.id||"").trim()||!At(a.importedAt)||!String(a.sourceFile||"").trim()||!Array.isArray(a.fingerprints)))&&t.push("CSV import history is incomplete."),(!Fe(e.prices)||!Fe(e.prices.quotes))&&t.push("Cached wallet prices are incomplete.")}function vn(e,t){return new Set((Array.isArray(e)?e:[]).filter(n=>n&&n.type===t).map(n=>String(n.related_entity_id||n.id||"")).filter(Boolean)).size}function En(e,t={}){const n=[],a=[];if(!Fe(e))return{valid:!1,counts:{},errors:["Backup must be a JSON object."],warnings:a};ga.includes(e.version)||n.push("Backup version is not supported."),At(e.exportedAt)||n.push("Backup export date is missing or invalid."),Pa(e.ledger,n),Ba(e,n),Ua(e,n,e.version);const o=Array.isArray(e.ledger)?e.ledger:[],d=Date.parse(String(t.latestLocalEventAt||"")),l=Date.parse(String(e.exportedAt||""));Number.isFinite(d)&&Number.isFinite(l)&&l<d&&a.push("This backup is older than your newest local finance event.");const u=Fe(e.metadata)?e.metadata:ea(e,jt,In);return{valid:n.length===0,version:e.version,currentVersion:$n,schemaLabel:String(u.schemaLabel||jt),appName:String(u.appName||In),exportedAt:At(e.exportedAt)?e.exportedAt:void 0,latestLocalEventAt:Fn(o)||void 0,counts:{ledgerEvents:o.length,accounts:vn(o,"asset.account_set"),recurringCosts:vn(o,"expense.recurring_set"),pipelineItems:vn(o,"pipeline.created"),goals:Array.isArray(e.goals?.goals)?e.goals.goals.length:0,importBatches:Array.isArray(e.imports?.batches)?e.imports.batches.length:0,cachedQuotes:Fe(e.prices?.quotes)?Object.keys(e.prices.quotes).length:0},errors:n,warnings:a}}function qa(e){const t=En(e);if(!t.valid||e.version!==1)throw new Error(t.errors.concat(e.version===1?[]:["Backup is not version 1."]).join(" "));return e}function za(e){const t=qa(e);return{...t,version:2,review:{lastReviewedAt:t.review.lastReviewedAt,accountReconciliations:{},checklist:{recurringCosts:!1,pipeline:!1,signals:!1},notes:""},goals:{goals:[]}}}function Va(e){const t=En(e);if(!t.valid)throw new Error(t.errors.join(" "));return e.version===1?za(e):e}const Ga=["personal","business","shared"];function Xt(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Ha(e,t="shared"){return Ga.includes(e)?e:t}function Wa(e,t){return t==="all"||e===t||e==="shared"}function Ya(e){const t=Xt(e)?e:{},n=Xt(t.accountReconciliations)?t.accountReconciliations:{},a={};Object.entries(n).forEach(([l,u])=>{if(!Xt(u)||!String(u.accountId||l).trim())return;const y=Number(u.balance),b=String(u.reviewedAt||"");!Number.isFinite(y)||!Number.isFinite(Date.parse(b))||(a[l]={accountId:String(u.accountId||l),balance:y,reviewedAt:b})});const o=Xt(t.checklist)?t.checklist:{};return{lastReviewedAt:(t.lastReviewedAt===null||Number.isFinite(Date.parse(String(t.lastReviewedAt||""))))&&t.lastReviewedAt||null,accountReconciliations:a,checklist:{recurringCosts:o.recurringCosts===!0,pipeline:o.pipeline===!0,signals:o.signals===!0},notes:typeof t.notes=="string"?t.notes:""}}function na(e){return{goals:(Xt(e)&&Array.isArray(e.goals)?e.goals:[]).flatMap(n=>{if(!Xt(n)||!String(n.id||"").trim()||!String(n.name||"").trim())return[];const a=Number(n.targetAmount);if(!Number.isFinite(a)||a<=0)return[];const o=Number.isFinite(Date.parse(String(n.createdAt||"")))?String(n.createdAt):new Date().toISOString(),d=Number.isFinite(Date.parse(String(n.updatedAt||"")))?String(n.updatedAt):o;return[{id:String(n.id),name:String(n.name),type:n.type==="savings"?"savings":"buffer",targetAmount:a,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(n.targetDate||""))?String(n.targetDate):void 0,scope:Ha(n.scope),linkedAccountIds:Array.isArray(n.linkedAccountIds)?n.linkedAccountIds.map(String).filter(Boolean):[],createdAt:o,updatedAt:d}]})}}function Qa(e,t,n="all"){const a=new Map((Array.isArray(t)?t:[]).map(o=>[String(o.id),o]));return na(e).goals.filter(o=>Wa(o.scope,n)).map(o=>{const d=o.linkedAccountIds.reduce((l,u)=>{const y=a.get(u);return l+Math.max(0,Number(y&&y.balance)||0)},0);return{...o,currentAmount:d,progressPercent:Math.min(100,Math.max(0,d/o.targetAmount*100))}})}const nn={baseCurrency:"EUR",forecastDays:90},bn={appearance:"bright",reducedMotion:!1,scopeFilter:"all",walletPriceSource:"manual",scenario:{marketMajors:0,burnDelta:0,probFloor:50}},jn={lastReviewedAt:null,accountReconciliations:{},checklist:{unresolvedItems:!1,matchPayments:!1,confirmObligations:!1,reviewSignals:!1,closeMonth:!1},notes:""},Un={goals:[]},qn={batches:[]},zn={quotes:{}},Ka={lastBackupAt:null};let Vn=Zn({indexedDbAvailable:!1,localStorageAvailable:!1,quotaAvailable:!1}),Gn="current";const Ja=Object.freeze({__financeMasterMissing:!0});function Te(e){return JSON.parse(JSON.stringify(e))}function un(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function xt(e,t){return Cn(e,t)}function Oe(e,t){Kt(e,t)}function Yt(e,t,n,a){const o=Number(e);return Number.isFinite(o)?Math.min(n,Math.max(t,o)):a}function Hn(e,t="bright"){return e==="midnight"||e==="bright"||e==="aurora"?e:t}function me(e,t="shared"){return e==="personal"||e==="business"||e==="shared"?e:t}function Wn(e,t="all"){return e==="all"?e:me(e,t==="all"?"shared":t)}function Bt(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function hn(e){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function Xa(e,t){if(t==="all")return!0;const n=me(e.metadata?.scope);return n===t||n==="shared"}function ct(e,t){window.dispatchEvent(new CustomEvent("finance:updated",{detail:{snapshot:Te(e),context:{source:t}}}))}const mn=new Map;function Jt(){mn.clear()}function Qt(){const e=xt(G.ledger,[]);return Array.isArray(e)?e:[]}function yn(e){Oe(G.ledger,e),Jt()}function Ue(e){const t=Cn(e,Ja),n=!(un(t)&&t.__financeMasterMissing===!0);return{present:n,value:n?t:void 0}}function ge(e,t){const n=Date.parse(String(t||""));let a=Number.isFinite(n)?n:Date.now();const o=z.getFinanceLedger().filter(d=>String(d.related_entity_id||"")===e).reduce((d,l)=>Math.max(d,Date.parse(l.timestamp)||0),0);return o>=a&&(a=o+1),new Date(a).toISOString()}function Za(e){return{type:"asset.account_set",amount:0,currency:e.currency,timestamp:e.timestamp,related_entity_id:Bt("cash"),metadata:{name:"Operating cash",balance:0,active:!0,scope:e.scope,bucket:"available",reserved:!1,source:"first-transaction-default-account"}}}function ei(e){const t=String(e??"");return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function ti(e){return window.FinanceDates?.toDateOnly?.(e)||String(e||"").slice(0,10)}function an(e,t,n,a){const o=z.getFinanceSettings().baseCurrency,d=ge(e),l=z.getActiveFinanceEvents().filter(u=>t.includes(u.type)).filter(u=>a?a(u):String(u.related_entity_id||"")===e).map(u=>({type:"finance.event_reversed",amount:0,currency:u.currency||o,timestamp:d,related_entity_id:u.id,metadata:{entity_id:e,reason:n,reversed_event_id:u.id}}));return l.length?z.appendFinanceEvents(l,{source:n}):[]}const z={async initialize(){await Ma([G.ledger,G.settings,G.ui,G.review,G.goals,G.imports,G.priceCache,G.backupMeta,G.demoSeed]),Vn=await xa(window),Gn=ka({ledger:Ue(G.ledger).value,settings:Ue(G.settings).value,ui:Ue(G.ui).value,review:Ue(G.review).value,goals:Ue(G.goals).value,imports:Ue(G.imports).value,priceCache:Ue(G.priceCache).value},jt).status},getFinanceSettings(){const e=xt(G.settings,nn);return un(e)?{baseCurrency:String(e.baseCurrency||nn.baseCurrency).trim().toUpperCase()||"EUR",forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||nn.forecastDays))}:Te(nn)},saveFinanceSettings(e){const t=this.getFinanceSettings(),n={baseCurrency:String(e.baseCurrency||t.baseCurrency).trim().toUpperCase()||t.baseCurrency,forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||t.forecastDays))};return Oe(G.settings,n),Jt(),ct(this.getFinancialSnapshot(!0),"saveFinanceSettings"),n},getUiSettings(){const e=xt(G.ui,bn);if(!un(e))return Te(bn);const t=un(e.scenario)?e.scenario:{};return{appearance:Hn(e.appearance),reducedMotion:e.reducedMotion===!0,scopeFilter:Wn(e.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":"manual",scenario:{marketMajors:Yt(t.marketMajors,-50,50,0),burnDelta:Yt(t.burnDelta,-30,30,0),probFloor:Yt(t.probFloor,0,100,50)}}},saveUiSettings(e){const t=this.getUiSettings(),n=e.scenario||t.scenario,a={appearance:Hn(e.appearance,t.appearance),reducedMotion:typeof e.reducedMotion=="boolean"?e.reducedMotion:t.reducedMotion,scopeFilter:Wn(e.scopeFilter,t.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":e.walletPriceSource==="manual"?"manual":t.walletPriceSource,scenario:{marketMajors:Yt(n.marketMajors,-50,50,t.scenario.marketMajors),burnDelta:Yt(n.burnDelta,-30,30,t.scenario.burnDelta),probFloor:Yt(n.probFloor,0,100,t.scenario.probFloor)}};return Oe(G.ui,a),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(a)})),a},getFinanceLedger(){const e=Qt();return window.FinanceEvents?.sortFinancialEvents?Te(window.FinanceEvents.sortFinancialEvents(e)):Te(e)},getActiveFinanceEvents(){const e=Qt();return window.FinanceLedger?.getActiveEvents?Te(window.FinanceLedger.getActiveEvents(e)):Te(e)},computeFinanceContext(e=!1,t="all"){if(!e&&mn.has(t))return Te(mn.get(t));if(!window.FinanceCompute?.computeFinancialContext)throw new Error("Finance compute module is unavailable.");const n=this.getFinanceSettings(),a=Qt().filter(d=>Xa(d,t)),o=window.FinanceCompute.computeFinancialContext(a,{...n,nowIso:new Date().toISOString()});return mn.set(t,o),Te(o)},getFinancialSnapshot(e=!1,t="all"){return this.computeFinanceContext(e,t).snapshot},getFinancialReadModel(e=!1,t="all"){return this.computeFinanceContext(e,t).readModel},appendFinanceEvent(e,t={}){return this.appendFinanceEvents([e],t)[0]||null},appendFinanceEvents(e,t={}){if(!e.length)return[];if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),a=this.getFinanceSettings(),o=window.FinanceLedger.appendEvents(Qt(),e,{...a,nowIso:n},{nowIso:n,allowApproximateTimestamp:!1});return yn(o.events),ct(this.getFinancialSnapshot(!0),String(t.source||"appendFinanceEvents")),Te(o.appended)},reverseFinanceEvent(e,t="undo"){if(!window.FinanceLedger?.reverseEvent)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),a=this.getFinanceSettings(),o=window.FinanceLedger.reverseEvent(Qt(),e,t,{...a,nowIso:n},{nowIso:n});return yn(o.events),ct(this.getFinancialSnapshot(!0),"reverseFinanceEvent"),Te(o.appended[0]||null)},reverseTransaction(e,t="ledger.transaction.reverse"){const n=(this.getFinancialReadModel().transactions||[]).find(y=>String(y.id)===String(e||"")||String(y.transactionEntityId||"")===String(e||""));if(!n)throw new Error("This transaction could not be found.");const a=String(n.id),o=String(n.transactionEntityId||""),d=this.getFinanceSettings().baseCurrency,l=ge(o||a),u=this.getActiveFinanceEvents().filter(y=>String(y.id)===a||!!o&&String(y.metadata?.transactionId||"")===o).map(y=>({type:"finance.event_reversed",amount:0,currency:y.currency||d,timestamp:l,related_entity_id:y.id,metadata:{entity_id:o||a,reason:t,reversed_event_id:y.id}}));return u.length?this.appendFinanceEvents(u,{source:"reverseTransaction"}):[]},recordTransaction(e){const t=(this.getFinancialReadModel().fiatAccounts||[]).find(b=>String(b.id)===String(e.accountId||"")),n=Number(e.amount);if(!t)throw new Error("Choose a cash account before saving this transaction.");if(!Number.isFinite(n)||n===0)throw new Error("Transaction amount must be non-zero.");const a=this.getFinanceSettings().baseCurrency,o=ge(`transaction-${e.accountId}`,e.timestamp),d=Bt("transaction"),l=me(e.scope,me(t.scope)),u=Math.round(((Number(t.balance)||0)+n)*100)/100,y={accountId:String(t.id),accountName:String(t.name||"Account"),categoryId:String(e.categoryId||"uncategorized"),scope:l,source:String(e.source||"manual"),importBatchId:e.importBatchId||void 0,fingerprint:e.fingerprint||void 0,sourceFile:e.sourceFile||void 0,obligationId:e.obligationId||void 0,obligationDueDate:e.obligationDueDate||void 0,obligationTitle:e.obligationTitle||void 0};return this.appendFinanceEvents([{type:n>0?"income.received":"expense.recorded",amount:Math.abs(n),currency:a,timestamp:o,related_entity_id:d,metadata:{...y,description:e.description}},{type:"asset.account_set",amount:u,currency:a,timestamp:ge(String(t.id),o),related_entity_id:String(t.id),metadata:{name:t.name,balance:u,active:!0,scope:l,bucket:t.bucket,reserved:t.reserved,transactionId:d,source:y.source,importBatchId:y.importBatchId}}],{source:e.source||"recordTransaction"})},recordLedgerTransaction(e){const t=String(e.type||"").toLowerCase(),n=Math.abs(Number(e.amount));if(!["income","expense","adjustment"].includes(t))throw new Error("Choose income, expense, or adjustment.");if(!Number.isFinite(n)||n<=0)throw new Error("Transaction amount must be positive.");const o=this.getFinancialReadModel().fiatAccounts||[],d=String(e.accountId||""),l=me(e.scope,"business");if(!d&&o.length===0){const v=this.getFinanceSettings().baseCurrency,M=ge("first-transaction-account",e.timestamp),E=Za({currency:v,timestamp:M,scope:l}),Y=String(E.related_entity_id||""),k=t==="income"?n:t==="expense"||e.direction==="decrease"?-n:n,F=e.categoryId||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),C=Bt(t==="adjustment"?"adjustment":"transaction"),R={type:t==="income"?"income.received":t==="expense"?"expense.recorded":"cash.adjusted",amount:n,currency:v,timestamp:ge(C,M),related_entity_id:C,metadata:{ledgerType:t==="adjustment"?"adjustment":void 0,direction:t==="adjustment"?e.direction==="decrease"?"decrease":"increase":void 0,description:e.description,accountId:Y,accountName:"Operating cash",categoryId:F,scope:l,source:"manual-ledger"}},te={type:"asset.account_set",amount:k,currency:v,timestamp:ge(Y,M),related_entity_id:Y,metadata:{name:"Operating cash",balance:k,active:!0,scope:l,bucket:"available",reserved:!1,transactionId:C,source:"manual-ledger"}};return this.appendFinanceEvents([E,R,te],{source:"recordLedgerTransaction.firstAccount"})}if(t==="income")return this.recordTransaction({description:e.description,amount:n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"client-income",scope:e.scope,source:"manual-ledger"});if(t==="expense")return this.recordTransaction({description:e.description,amount:-n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"uncategorized",scope:e.scope,source:"manual-ledger"});const u=(this.getFinancialReadModel().fiatAccounts||[]).find(v=>String(v.id)===String(e.accountId||""));if(!u)throw new Error("Choose a cash account before saving this adjustment.");const y=e.direction==="decrease"?"decrease":"increase",b=y==="decrease"?-n:n,A=this.getFinanceSettings().baseCurrency,w=ge(`adjustment-${e.accountId}`,e.timestamp),W=Bt("adjustment"),V=me(e.scope,me(u.scope)),h=Math.round(((Number(u.balance)||0)+b)*100)/100;return this.appendFinanceEvents([{type:"cash.adjusted",amount:n,currency:A,timestamp:w,related_entity_id:W,metadata:{ledgerType:"adjustment",direction:y,description:e.description,accountId:String(u.id),accountName:String(u.name||"Account"),categoryId:String(e.categoryId||"adjustment"),scope:V,source:"manual-ledger"}},{type:"asset.account_set",amount:h,currency:A,timestamp:ge(String(u.id),w),related_entity_id:String(u.id),metadata:{name:u.name,balance:h,active:!0,scope:me(u.scope),bucket:u.bucket,reserved:u.reserved,transactionId:W,source:"manual-ledger"}}],{source:"recordLedgerTransaction.adjustment"})},recordTransfer(e){const t=this.getFinancialReadModel(),n=(t.fiatAccounts||[]).find(w=>String(w.id)===String(e.fromAccountId||"")),a=(t.fiatAccounts||[]).find(w=>String(w.id)===String(e.toAccountId||"")),o=Math.abs(Number(e.amount));if(!n||!a)throw new Error("Choose both transfer accounts.");if(String(n.id)===String(a.id))throw new Error("Transfer accounts must be different.");if(!Number.isFinite(o)||o<=0)throw new Error("Transfer amount must be positive.");const d=this.getFinanceSettings().baseCurrency,l=ge(`transfer-${n.id}-${a.id}`,e.timestamp),u=Bt("transfer"),y=me(e.scope,me(n.scope)),b=Math.round(((Number(n.balance)||0)-o)*100)/100,A=Math.round(((Number(a.balance)||0)+o)*100)/100;return this.appendFinanceEvents([{type:"transfer.recorded",amount:o,currency:d,timestamp:l,related_entity_id:u,metadata:{ledgerType:"transfer",direction:"transfer",description:e.description||`Transfer from ${String(n.name||"account")} to ${String(a.name||"account")}`,fromAccountId:String(n.id),fromAccountName:String(n.name||"From account"),toAccountId:String(a.id),toAccountName:String(a.name||"To account"),accountId:String(n.id),accountName:String(n.name||"From account"),categoryId:String(e.categoryId||"transfer"),scope:y,source:"manual-ledger"}},{type:"asset.account_set",amount:b,currency:d,timestamp:ge(String(n.id),l),related_entity_id:String(n.id),metadata:{name:n.name,balance:b,active:!0,scope:me(n.scope),bucket:n.bucket,reserved:n.reserved,transactionId:u,source:"manual-ledger"}},{type:"asset.account_set",amount:A,currency:d,timestamp:ge(String(a.id),l),related_entity_id:String(a.id),metadata:{name:a.name,balance:A,active:!0,scope:me(a.scope),bucket:a.bucket,reserved:a.reserved,transactionId:u,source:"manual-ledger"}}],{source:"recordTransfer"})},reviewObligation(e){const n=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(W=>String(W.id||"")===String(e.id||""));if(!n)throw new Error("This obligation could not be found.");const a=e.status;if(a!=="paid"&&a!=="deferred"&&a!=="needs_review")throw new Error("Choose a valid obligation status.");const o=this.getFinanceSettings().baseCurrency,d=Math.abs(Number(e.amount??n.amount));if(!Number.isFinite(d)||d<=0)throw new Error("Obligation amount must be positive.");let l="",u="",y="";const b=me(n.scope);if(a==="paid"){if(!e.accountId)throw new Error("Choose the account that paid this obligation.");const W=(this.getFinancialReadModel().fiatAccounts||[]).find(h=>String(h.id)===String(e.accountId));if(!W)throw new Error("Choose a valid payment account.");u=String(W.id),y=String(W.name||"Account");const V=this.recordTransaction({description:`Paid ${String(n.title||"obligation")}`,amount:-d,timestamp:hn(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)),accountId:u,categoryId:"obligation",scope:b,source:"obligation.review",obligationId:String(n.id),obligationDueDate:String(n.dueDate||""),obligationTitle:String(n.title||"Obligation")});l=String(V[0]?.related_entity_id||V[0]?.id||"")}if(a==="deferred"&&!e.deferredUntil)throw new Error("Choose a new due date for this deferred obligation.");const A=ge(String(e.id)),w=this.appendFinanceEvent({type:"obligation.reviewed",amount:d,currency:o,timestamp:A,related_entity_id:String(e.id),metadata:{status:a,title:String(n.title||"Obligation"),dueDate:String(n.dueDate||""),originalDueDate:String(n.originalDueDate||n.dueDate||""),paidAt:a==="paid"?hn(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)):void 0,deferredUntil:a==="deferred"?e.deferredUntil:void 0,accountId:u,accountName:y,transactionId:l,scope:b,notes:e.notes||""}},{source:"reviewObligation"});return w?[w]:[]},reviewTransaction(e){const n=(this.getFinancialReadModel().transactions||[]).find(u=>String(u.id)===String(e.id||"")||String(u.transactionEntityId||"")===String(e.id||""));if(!n)throw new Error("This transaction could not be found.");const a=String(e.categoryId||"").trim();if(!a)throw new Error("Choose a category for this transaction.");const o=this.getFinanceSettings().baseCurrency,d=String(n.id||e.id),l=this.appendFinanceEvent({type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:o,timestamp:ge(d),related_entity_id:d,metadata:{categoryId:a,scope:me(e.scope,me(n.scope)),reviewStatus:"reviewed",notes:String(e.notes||"")}},{source:"reviewTransaction"});return l?[l]:[]},matchTransactionToObligation(e){const n=(this.getFinancialReadModel().transactions||[]).find(b=>String(b.id)===String(e.transactionId||"")||String(b.transactionEntityId||"")===String(e.transactionId||""));if(!n)throw new Error("This payment could not be found.");if(String(n.type)!=="expense.recorded")throw new Error("Only expense payments can be matched to obligations.");const o=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(b=>String(b.id||"")===String(e.obligationId||""));if(!o)throw new Error("Choose an obligation to match this payment to.");const d=this.getFinanceSettings().baseCurrency,l=String(n.id||e.transactionId),u=me(o.scope,me(n.scope)),y=ge(String(o.id));return this.appendFinanceEvents([{type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:d,timestamp:y,related_entity_id:l,metadata:{categoryId:"obligation",scope:me(n.scope),reviewStatus:"reviewed",obligationId:String(o.id),obligationTitle:String(o.title||"Obligation"),notes:String(e.notes||"")}},{type:"obligation.reviewed",amount:Math.abs(Number(n.amount)||Number(o.amount)||0),currency:d,timestamp:ge(String(o.id),y),related_entity_id:String(o.id),metadata:{status:"paid",title:String(o.title||"Obligation"),dueDate:String(o.dueDate||""),originalDueDate:String(o.originalDueDate||o.dueDate||""),paidAt:String(n.timestamp||new Date().toISOString()),accountId:String(n.accountId||""),accountName:String(n.accountName||""),transactionId:l,scope:u,notes:String(e.notes||"")}}],{source:"matchTransactionToObligation"})},updatePipelineReview(e){const t=this.getFinancialReadModel(),n=(t.pipelineDeals||[]).find(b=>String(b.id)===String(e.id||""));if(!n)throw new Error("This pipeline item could not be found.");const a=String(e.status||"").toLowerCase();if(!["confirmed","expected","risky"].includes(a))throw new Error("Choose confirmed, expected, or risky.");const o=Number(e.probability);if(!Number.isFinite(o)||o<0||o>1)throw new Error("Probability must be between 0 and 1.");const d=window.FinanceDates?.toDateOnly?.(e.expectedDateISO)||"";if(!d)throw new Error("Choose a valid expected date.");const l=(t.fiatAccounts||[]).find(b=>String(b.id)===String(e.destinationAccountId||"")),u=this.getFinanceSettings().baseCurrency,y=ge(String(n.id));return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:u,timestamp:y,related_entity_id:String(n.id),metadata:{stage:a,status:a,title:n.title,scope:me(n.scope),expectedDateISO:d,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:l?String(l.name||""):"",notes:String(e.notes||"")}},{type:"pipeline.probability_changed",amount:o,currency:u,timestamp:ge(String(n.id),y),related_entity_id:String(n.id),metadata:{probability:o,scope:me(n.scope),expectedDateISO:d,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:l?String(l.name||""):"",notes:String(e.notes||"")}}],{source:"updatePipelineReview"})},cancelPipelineItem(e,t=""){const n=(this.getFinancialReadModel().pipelineDeals||[]).find(o=>String(o.id)===String(e||""));if(!n)throw new Error("This pipeline item could not be found.");const a=this.getFinanceSettings().baseCurrency;return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:a,timestamp:ge(String(n.id)),related_entity_id:String(n.id),metadata:{stage:"cancelled",status:"cancelled",title:n.title,scope:me(n.scope),notes:t}}],{source:"cancelPipelineItem"})},saveDebtPlan(e){const t=(this.getFinancialReadModel().debtAccounts||[]).find(u=>String(u.id)===String(e.id||""));if(!t)throw new Error("This debt item could not be found.");let n=window.FinanceDates?.toDateOnly?.(e.dueDate)||"",a=Math.abs(Number(e.minimumPayment));const o=e.planType||"regular";if(o==="custom"){const u=Array.isArray(e.installments)?e.installments:[];if(!u.length)throw new Error("Add at least one installment for a custom plan.");const y=[...u].sort((b,A)=>b.date.localeCompare(A.date));n=window.FinanceDates?.toDateOnly?.(y[0].date)||n,a=Math.abs(Number(y[0].amount))||0}else{if(!n)throw new Error("Choose a debt due date.");if(!Number.isFinite(a)||a<=0)throw new Error("Add a positive minimum payment.")}const d=this.getFinanceSettings().baseCurrency,l=this.appendFinanceEvent({type:"debt.plan_updated",amount:a,currency:d,timestamp:ge(String(t.id)),related_entity_id:String(t.id),metadata:{name:t.name,scope:me(t.scope),dueDate:n,minimumPayment:a,paymentPlanNote:String(e.paymentPlanNote||"").trim(),planType:o,frequency:String(e.frequency||"monthly"),installments:e.installments||[]}},{source:"saveDebtPlan"});return l?[l]:[]},deactivateFiatAccount(e){return an(e,["asset.account_set"],"deactivateFiatAccount",t=>{const n=t.metadata||{};return String(t.related_entity_id||"")===e||String(n.accountId||"")===e})},deactivateRecurringExpense(e){return an(e,["expense.recurring_set"],"deactivateRecurringExpense")},deactivateWeb3Position(e){return an(e,["asset.position_set"],"deactivateWeb3Position")},deactivateDefiPosition(e){return an(e,["asset.defi_set"],"deactivateDefiPosition")},deactivateDebtAccount(e){return an(e,["debt.added","debt.payment_made"],"deactivateDebtAccount")},markPipelineItemPaid(e,t={}){const n=this.getFinancialReadModel(),a=(n.pipelineDeals||[]).find(A=>String(A.id)===e);if(!a||String(a.status).toLowerCase()==="paid")return[];const o=this.getFinanceSettings().baseCurrency,d=ge(e,t.timestamp),l=Math.abs(Number(a.value)||0),u=String(t.destinationAccountId||a.destinationAccountId||""),y=(n.fiatAccounts||[]).find(A=>String(A.id)===u);if(!y)throw new Error("Choose a settlement account before marking this pipeline item as paid.");const b=[{type:"pipeline.stage_changed",amount:0,currency:o,timestamp:d,related_entity_id:e,metadata:{stage:"paid",status:"paid",title:a.title,scope:me(a.scope)}},{type:"invoice.paid",amount:l,currency:o,timestamp:d,related_entity_id:e,metadata:{client:a.title,amount:l,expectedDate:a.expectedDateISO,destinationAccountId:u,scope:me(a.scope)}},{type:"income.received",amount:l,currency:o,timestamp:d,related_entity_id:e,metadata:{description:`Invoice paid: ${String(a.title||"Invoice")}`,invoiceId:e,destinationAccountId:u,accountId:u,accountName:y.name,categoryId:"client-income",scope:me(a.scope),source:"pipeline-settlement"}}];if(y){const A=Math.round(((Number(y.balance)||0)+l)*100)/100;b.push({type:"asset.account_set",amount:A,currency:o,timestamp:ge(String(y.id),d),related_entity_id:String(y.id),metadata:{name:y.name,balance:A,active:!0,scope:me(y.scope),bucket:y.bucket,reserved:y.reserved,invoiceId:e,settlementTransfer:!0}})}return this.appendFinanceEvents(b,{source:"markPipelineItemPaid"})},getReviewState(){return Ya(xt(G.review,jn))},completeWeeklyReview(e={}){const n=this.getFinancialReadModel().fiatAccounts||[],a=Array.isArray(e.accounts)?e.accounts:n.map(b=>({accountId:String(b.id),balance:Number(b.balance)||0}));if(a.some(b=>!String(b.accountId||"").trim()||!Number.isFinite(Number(b.balance))))throw new Error("Each reconciled account needs a valid balance.");const o=new Date().toISOString(),d=this.getFinanceSettings().baseCurrency,l=a.flatMap(b=>{const A=n.find(W=>String(W.id)===String(b.accountId)),w=Number(b.balance);return!A||!Number.isFinite(w)||w===Number(A.balance)?[]:[{type:"asset.account_set",amount:w,currency:d,timestamp:ge(String(A.id),o),related_entity_id:String(A.id),metadata:{name:A.name,balance:w,active:!0,scope:me(A.scope),bucket:A.bucket,reserved:A.reserved,source:"weekly-review-reconciliation"}}]});l.length&&this.appendFinanceEvents(l,{source:"completeWeeklyReview.reconcile"});const u=Object.fromEntries(a.map(b=>[String(b.accountId),{accountId:String(b.accountId),balance:Number(b.balance),reviewedAt:o}])),y={lastReviewedAt:o,accountReconciliations:u,checklist:{unresolvedItems:e.unresolvedItems!==!1,matchPayments:e.matchPayments!==!1,confirmObligations:e.confirmObligations!==!1,reviewSignals:e.reviewSignals!==!1,closeMonth:e.closeMonth!==!1},notes:String(e.notes||"")};return Oe(G.review,y),ct(this.getFinancialSnapshot(!0),"completeWeeklyReview"),y},getGoals(){return na(xt(G.goals,Un))},getGoalProgress(e="all"){return Qa(this.getGoals(),this.getFinancialReadModel(!1,"all").fiatAccounts||[],e)},saveGoal(e){const t=this.getGoals(),n=t.goals.find(l=>l.id===e.id),a=new Date().toISOString(),o=Number(e.targetAmount);if(!String(e.name||"").trim())throw new Error("Add a name for this goal.");if(!Number.isFinite(o)||o<=0)throw new Error("Goal target must be greater than zero.");const d={id:n?.id||Bt("goal"),name:String(e.name).trim(),type:e.type==="savings"?"savings":"buffer",targetAmount:o,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(e.targetDate||""))?e.targetDate:void 0,scope:me(e.scope,n?.scope||"shared"),linkedAccountIds:Array.isArray(e.linkedAccountIds)?e.linkedAccountIds.map(String).filter(Boolean):[],createdAt:n?.createdAt||a,updatedAt:a};return t.goals=n?t.goals.map(l=>l.id===d.id?d:l):[...t.goals,d],Oe(G.goals,t),ct(this.getFinancialSnapshot(!0),"saveGoal"),Te(d)},deleteGoal(e){const t=this.getGoals();return t.goals=t.goals.filter(n=>n.id!==String(e)),Oe(G.goals,t),ct(this.getFinancialSnapshot(!0),"deleteGoal"),Te(t)},getImportState(){return xt(G.imports,qn)},importCsvTransactions(e,t){const n=String(t.sourceFile||"pasted-transactions.csv"),a=new Set(this.getActiveFinanceEvents().map(b=>String(b.metadata?.fingerprint||"")).filter(Boolean)),o=Bt("import");let d=0,l=0;const u=[];e.forEach(b=>{if(a.has(b.fingerprint)){l+=1;return}a.add(b.fingerprint),u.push(b.fingerprint),this.recordTransaction({description:b.description,amount:b.amount,timestamp:hn(b.date),accountId:t.accountId,categoryId:b.categoryId,scope:b.scope,source:"csv-import",importBatchId:o,fingerprint:b.fingerprint,sourceFile:n}),d+=1});const y=this.getImportState();return y.batches.push({id:o,importedAt:new Date().toISOString(),sourceFile:n,fingerprints:u}),Oe(G.imports,y),{batchId:o,imported:d,duplicates:l}},exportTransactionsCsv(){const e=["date","description","amount","direction","type","account","accountId","category","scope","reviewStatus","linkedObligationId","linkedIncomeId","source"],t=(this.getFinancialReadModel().transactions||[]).map(n=>{const a=Number(n.signedAmount??n.amount)||0;return[ti(n.timestamp),n.description,a,n.direction||(a<0?"out":"in"),n.ledgerType||n.type,n.accountName||n.fromAccountName||"",n.accountId||n.fromAccountId||"",n.categoryId,n.scope,n.reviewStatus,n.obligationId,n.linkedIncomeId,n.source].map(ei).join(",")});return[e.join(","),...t].join(`
`)},undoImportBatch(e){const t=this.getFinanceSettings().baseCurrency,n=this.getActiveFinanceEvents().filter(a=>String(a.metadata?.importBatchId||"")===String(e)).map(a=>({type:"finance.event_reversed",amount:0,currency:a.currency||t,timestamp:ge(String(a.related_entity_id||a.id)),related_entity_id:a.id,metadata:{reason:"undoImportBatch",reversed_event_id:a.id,importBatchId:e}}));return n.length?this.appendFinanceEvents(n,{source:"undoImportBatch"}):[]},getPriceCache(){return xt(G.priceCache,zn)},async refreshCryptoPrices(){const e=this.getUiSettings(),t=_a(e.walletPriceSource),n=(this.getFinancialReadModel().web3Positions||[]).filter(b=>b.manualPriceOverride!==!0);if(!n.length||t.id==="manual")return{updated:0,source:t.id};const a=n.map(b=>String(b.symbolOrName||"")).filter(Boolean);let o;try{o=await t.getQuotes(a,this.getFinanceSettings().baseCurrency)}catch(b){return{updated:0,source:t.id,error:b instanceof Error?b.message:"Price refresh failed."}}const d=new Map(o.map(b=>[b.symbol.toUpperCase(),b])),l=this.getFinanceSettings().baseCurrency,u=n.flatMap(b=>{const A=d.get(String(b.symbolOrName||"").toUpperCase());return A?[{type:"asset.position_set",amount:0,currency:l,timestamp:new Date().toISOString(),related_entity_id:String(b.id),metadata:{symbolOrName:b.symbolOrName,chain:b.chain,amount:b.amount,price:A.price,liquidity:b.liquidity,scope:me(b.scope),priceSource:A.source,priceUpdatedAt:A.quotedAt,manualPriceOverride:!1}}]:[]}),y=this.getPriceCache();return o.forEach(b=>{y.quotes[b.symbol.toUpperCase()]=b}),Oe(G.priceCache,y),u.length&&this.appendFinanceEvents(u,{source:"refreshCryptoPrices"}),{updated:u.length,source:t.id}},exportBackup(){const e=new Date().toISOString(),t={version:$n,exportedAt:e,ledger:this.getFinanceLedger(),financeSettings:this.getFinanceSettings(),uiSettings:this.getUiSettings(),review:this.getReviewState(),goals:this.getGoals(),imports:this.getImportState(),prices:this.getPriceCache()};return{...t,metadata:ea(t,jt,In)}},recordBackupExport(e=new Date().toISOString()){Oe(G.backupMeta,{lastBackupAt:e})},previewBackup(e){return En(e,{latestLocalEventAt:this.getLocalDataHealth().latestEventAt})},restoreBackup(e){const t=Va(e);return Oe(G.ledger,t.ledger),Oe(G.settings,t.financeSettings||nn),Oe(G.ui,t.uiSettings||bn),Oe(G.review,t.review||jn),Oe(G.goals,t.goals||Un),Oe(G.imports,t.imports||qn),Oe(G.priceCache,t.prices||zn),Kt(G.demoSeed,"restored-backup"),Jt(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(this.getUiSettings())})),ct(this.getFinancialSnapshot(!0),"restoreBackup"),this.exportBackup()},getLocalDataHealth(){const e=xt(G.backupMeta,Ka);return{...Ca({ledger:Ue(G.ledger),settings:Ue(G.settings),ui:Ue(G.ui),review:Ue(G.review),goals:Ue(G.goals),imports:Ue(G.imports),priceCache:Ue(G.priceCache)}),...Vn,schemaLabel:jt,backupVersion:$n,lastBackupAt:typeof e.lastBackupAt=="string"?e.lastBackupAt:null,migrationStatus:Gn,storageKeys:[..._n]}},resetLocalFinanceData(){return _n.forEach(e=>ln(e)),Kt(G.demoSeed,"deleted"),Jt(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:Te(this.getUiSettings())})),ct(this.getFinancialSnapshot(!0),"resetLocalFinanceData"),this.getLocalDataHealth()},deleteInvoice(e,t={}){const n=this.getFinanceSettings().baseCurrency,a=ge(e,t.timestamp),o=[];return t.reverseSettlement===!0&&this.getActiveFinanceEvents().filter(d=>{const l=d.metadata||{};return String(d.related_entity_id||"")===e||String(l.invoiceId||"")===e}).filter(d=>["invoice.paid","income.received","asset.account_set"].includes(d.type)).forEach(d=>o.push({type:"finance.event_reversed",amount:0,currency:d.currency||n,timestamp:a,related_entity_id:d.id,metadata:{reason:"deleteInvoice",reversed_event_id:d.id,entity_id:e}})),o.push({type:"pipeline.stage_changed",amount:0,currency:n,timestamp:a,related_entity_id:e,metadata:{stage:"cancelled",status:"cancelled"}}),this.appendFinanceEvents(o,{source:"deleteInvoice"})},seedDemoIfNeeded(e=!1){const t=Qt();if(!e&&t.length>0){Cn(G.demoSeed,"")||Kt(G.demoSeed,"existing-ledger");return}const n=this.getFinanceSettings().baseCurrency,a=new Date().toISOString(),o=fa(n);if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const d=window.FinanceLedger.appendEvents([],o,{...this.getFinanceSettings(),nowIso:a},{nowIso:a,allowApproximateTimestamp:!1});yn(d.events),Kt(G.demoSeed,"1"),ct(this.getFinancialSnapshot(!0),"seedDemoIfNeeded")},clearAndReseedDemo(){ln(G.ledger),ln(G.demoSeed),Jt(),this.seedDemoIfNeeded(!0),ct(this.getFinancialSnapshot(!0),"clearAndReseedDemo")},deleteSampleData(){ln(G.ledger),Kt(G.demoSeed,"deleted"),Jt(),ct(this.getFinancialSnapshot(!0),"deleteSampleData")}};function kn(e){const t=e.getUiSettings();document.documentElement.dataset.appearance=t.appearance,document.documentElement.classList.toggle("settings-reduced-motion",t.reducedMotion),document.body.classList.toggle("settings-reduced-motion",t.reducedMotion)}const ni=[",",";","	"];function ai(e){return String(e||"").toLowerCase().replace(/[^a-z0-9]/g,"")}function Ot(e,t){return e.find(n=>t.includes(ai(n)))||""}function Dn(e,t){const n=[];let a="",o=!1;for(let d=0;d<e.length;d+=1){const l=e[d];l==='"'&&e[d+1]==='"'?(a+='"',d+=1):l==='"'?o=!o:l===t&&!o?(n.push(a.trim()),a=""):a+=l}return n.push(a.trim()),n}function ii(e){const t=ni.map(n=>({delimiter:n,fields:Dn(e,n).length})).sort((n,a)=>a.fields-n.fields);return t[0].fields>1?t[0].delimiter:","}function Mn(e){const t=String(e||"").split(/\r?\n/).filter(o=>o.trim());if(t.length<2)throw new Error("Provide a header row and at least one transaction.");const n=ii(t[0]),a=Dn(t[0],n).map(o=>o.trim());if(a.some(o=>!o))throw new Error("Every CSV column needs a header.");if(new Set(a).size!==a.length)throw new Error("CSV headers must be unique.");return{delimiter:n,headers:a,rows:t.slice(1).map((o,d)=>({rowNumber:d+2,values:Dn(o,n)}))}}function aa(e){return{date:Ot(e,["date","bookingdate","transactiondate","valuedate"]),description:Ot(e,["description","memo","note","details","payee","reference","narrative"]),amount:Ot(e,["amount","value","total","transactionamount"]),debit:Ot(e,["debit","withdrawal","outflow","moneyout"]),credit:Ot(e,["credit","deposit","inflow","moneyin"]),category:Ot(e,["category","categoryid"]),scope:Ot(e,["scope","group"])}}function oi(e){const t=String(e||"").trim(),n=t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/),a=n?`${n[3]}-${n[2].padStart(2,"0")}-${n[1].padStart(2,"0")}`:t,o=Date.parse(`${a}T12:00:00`);return Number.isFinite(o)?new Date(o).toISOString().slice(0,10):""}function wn(e){const t=String(e||"").trim();if(!t)return 0;const n=t.startsWith("(")&&t.endsWith(")");let a=t.replace(/[()\s']/g,"").replace(/[^\d,.-]/g,"");const o=a.lastIndexOf(","),d=a.lastIndexOf(".");if(o>=0&&d>=0){const u=o>d?",":".";a=a.replace(u===","?/\./g:/,/g,"").replace(u,".")}else if(o>=0){const u=a.length-o-1;a=u>0&&u<=2?a.replace(",","."):a.replace(/,/g,"")}const l=Number(a);return Number.isFinite(l)?n?-Math.abs(l):l:Number.NaN}function Rt(e,t,n){if(!n)return"";const a=e.headers.indexOf(n);return a>=0?String(t.values[a]||"").trim():""}function ri(e){return`${e.date}|${e.description.trim().toLowerCase()}|${Number(e.amount).toFixed(2)}`}function si(e,t,n={}){const a=[],o=[],d=[],l=new Set(n.existingFingerprints||[]),u=new Set,y=String(n.defaultCategory||"uncategorized").trim()||"uncategorized",b=["personal","shared"].includes(n.defaultScope)?n.defaultScope:"business",A=new Set(e.headers),w=[t.date,t.description].filter(Boolean);if(w.length!==2||w.some(h=>!A.has(h)))throw new Error("Map both the date and description columns.");const W=!!(t.amount&&A.has(t.amount)),V=!!(t.debit&&A.has(t.debit)||t.credit&&A.has(t.credit));if(!W&&!V)throw new Error("Map a signed amount column or at least one debit or credit column.");return e.rows.forEach(h=>{const v=oi(Rt(e,h,t.date)),M=Rt(e,h,t.description),E=W?wn(Rt(e,h,t.amount)):Math.abs(wn(Rt(e,h,t.credit)))-Math.abs(wn(Rt(e,h,t.debit)));if(!v){a.push({rowNumber:h.rowNumber,reason:"Date is missing or invalid."});return}if(!M){a.push({rowNumber:h.rowNumber,reason:"Description is missing."});return}if(!Number.isFinite(E)||E===0){a.push({rowNumber:h.rowNumber,reason:"Amount must be non-zero."});return}const Y=Rt(e,h,t.scope).toLowerCase(),k=["personal","business","shared"].includes(Y)?Y:b,F={date:v,description:M,amount:Math.round(E*100)/100,categoryId:Rt(e,h,t.category)||y,scope:k};if(F.fingerprint=ri(F),l.has(F.fingerprint)||u.has(F.fingerprint)){o.push(F);return}u.add(F.fingerprint),d.push(F)}),{rows:d,rejected:a,duplicates:o,sourceFile:String(n.sourceFile||"pasted-transactions.csv")}}function ci(e){return e==="	"?"Tab":e===";"?"Semicolon":"Comma"}function D(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ft(e="shared"){return[["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function li(e="all"){return`<option value="all"${e==="all"?" selected":""}>All scopes</option>${ft(e)}`}function It(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Unknown date"}function di(e){const t=String(e||"").replace(/_/g," ").replace(/\./g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Transaction"}function ui(e){const t=Number(e.signedAmount);if(Number.isFinite(t))return t;const n=Math.abs(Number(e.amount)||0);return String(e.type)==="expense.recorded"?-n:n}function Re(e,t=!1){return`
    <div class="modal-actions">
      <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
      <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'${e}'">${t?"Save":"Create"}</button>
    </div>
  `}function ia(e,t){return t?`<button class="btn-danger ui-btn" type="button" data-action="${e}">Deactivate</button>`:""}function mi(){return`
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
  `}function pi(e="expense",t){const n=["expense","income","transfer","adjustment"].includes(e)?e:"expense";return`
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
          <select id="modal-fast-txn-scope">${ft("business")}</select>
        </div>
        <div class="form-group fg-note">
          <label for="modal-fast-txn-desc">Note <span class="fin-text-med">(optional)</span></label>
          <input id="modal-fast-txn-desc" placeholder="Client payment or studio rent" data-autofocus />
        </div>
      </div>
      ${Re("transaction")}
    </div>
  `}const Qe=document.querySelector("#modal-overlay"),Ct=document.querySelector("#modal-body");let qt="",wt="",sn="",Tn="pasted-transactions.csv",Ge=null,dt={date:"",description:""},ze=null,pn="uncategorized",fn="business",Lt=null,Zt=null,Nn=null,en=null;const ee={search:"",accountId:"",scope:"all",categoryId:"",type:"all",reviewStatus:"all",dateFrom:"",dateTo:""};function S(e){return document.querySelector(`#${e}`)?.value.trim()||""}function oa(e){return document.querySelector(`#${e}`)?.checked===!0}function ut(){return window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10)}function Yn(e=ut()){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function on(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function De(e){const t=z.getFinanceSettings();return new Intl.NumberFormat(void 0,{style:"currency",currency:t.baseCurrency,maximumFractionDigits:2}).format(Number(e)||0)}function fi(){const e=en;return e?`
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
  `:'<div class="modal-form"><h2 id="modal-title">Confirmation unavailable</h2><p class="modal-copy">Close this dialog and try the action again.</p></div>'}function gi(){const e=document.querySelector("#modal-destructive-phrase"),t=document.querySelector("#modal-destructive-confirm");!e||!t||!en||(t.disabled=e.value!==en.phrase)}function _t(e="",t="Not mapped"){const n=Ge?.headers||[];return`<option value="">${t}</option>${n.map(a=>`<option value="${D(a)}"${a===e?" selected":""}>${D(a)}</option>`).join("")}`}function ie(e){if(!Ct)return;let t=Ct.querySelector(".modal-error");t||(t=document.createElement("div"),t.className="modal-error",t.setAttribute("role","alert"),t.tabIndex=-1,Ct.querySelector("h2")?.insertAdjacentElement("afterend",t)),t.textContent=e,t.focus()}function vi(){const e=z.getFinancialSnapshot(),t=z.getFinancialReadModel(),n=window.FinanceDates?.toDateOnly?.(ee.dateFrom)||"",a=window.FinanceDates?.toDateOnly?.(ee.dateTo)||"",o=ee.search.toLowerCase(),d=(t.transactions||[]).filter(l=>!ee.accountId||String(l.accountId)===ee.accountId||String(l.fromAccountId)===ee.accountId||String(l.toAccountId)===ee.accountId).filter(l=>ee.scope==="all"||String(l.scope)===ee.scope).filter(l=>!ee.categoryId||String(l.categoryId).toLowerCase().includes(ee.categoryId.toLowerCase())).filter(l=>ee.type==="all"||String(l.ledgerType||l.type)===ee.type||String(l.type)===ee.type).filter(l=>ee.reviewStatus==="all"||String(l.reviewStatus||"clear")===ee.reviewStatus).filter(l=>o?[l.description,l.accountName,l.fromAccountName,l.toAccountName,l.categoryId].some(u=>String(u||"").toLowerCase().includes(o)):!0).filter(l=>{const u=window.FinanceDates?.toDateOnly?.(l.timestamp)||"";return(!n||u>=n)&&(!a||u<=a)});return`
    <div class="modal-form">
      <h2 id="modal-title">Transactions</h2>
      <p class="modal-copy">A searchable raw log. Use it as evidence for the Observatory, not as the center of the product.</p>
      <div class="modal-grid-two">
        ${[["Available cash",De(e.availableCash??e.trulyAvailableCash??e.realBalance)],["Reserved",De(e.reservedCash??0)],["Total cash",De(e.totalCash??e.realBalance)],["Monthly burn",De(e.monthlyBurn)],["Runway",e.runwayMonths==null?"Unknown":`${Number(e.runwayMonths).toFixed(1)} months`],["Debt remaining",De(e.debtRemaining??e.totalDebt)]].map(([l,u])=>`
          <div class="form-group"><label>${l}</label><input aria-label="${l}" value="${D(u)}" readonly /></div>
        `).join("")}
      </div>
      <div class="modal-section">
        <div class="ui-title">Filter ledger</div>
        <div class="modal-grid-three">
          <input id="modal-filter-search" aria-label="Search transactions" value="${D(ee.search)}" placeholder="Search note, account, category" />
          <select id="modal-filter-account" aria-label="Filter by account">${St(ee.accountId)}</select>
          <select id="modal-filter-scope" aria-label="Filter by scope">${li(ee.scope)}</select>
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
        ${d.length?d.map(l=>{const u=ui(l),y=u>=0,b=l.ledgerType==="transfer"?`${D(l.fromAccountName||"From account")} → ${D(l.toAccountName||"To account")}`:D(l.accountName||"Unassigned");return`
          <div class="modal-list-row">
            <span><strong>${D(l.description||l.type)}</strong><br><small>${b} · ${D(l.categoryId||"uncategorized")} · ${D(l.reviewStatus||"clear")} · ${It(l.timestamp)}</small></span>
            <span>${di(l.ledgerType||l.type)}${l.obligationId?` · ${D(l.obligationTitle||l.obligationId)}`:""}</span>
            <span class="${y?"fin-val-pos":"fin-val-neg"}">${y?"+":"-"}${De(Math.abs(u))}</span>
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
          <input id="modal-txn-date" aria-label="Transaction date" type="date" value="${ut()}" />
          <select id="modal-txn-account" aria-label="Transaction account">${St("",!1)}</select>
          <select id="modal-txn-to-account" aria-label="Transfer destination account">${St("",!1)}</select>
          <select id="modal-txn-direction" aria-label="Adjustment direction"><option value="increase">Increase account</option><option value="decrease">Decrease account</option></select>
          <input id="modal-txn-category" aria-label="Transaction category" placeholder="Category" value="uncategorized" />
          <select id="modal-txn-scope" aria-label="Transaction scope">${ft("business")}</select>
        </div>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="addTransaction">Add transaction</button>
      </div>
    </div>
  `}function bi(e="expense"){return pi(e,{accountOptions:St,today:ut})}function hi(e=""){const t=(z.getFinancialReadModel().pipelineDeals||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark pipeline item as paid</h2>
      <p class="modal-copy">${D(t?.title||"Pipeline item")} · ${De(t?.value)}</p>
      <input id="modal-settle-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-settle-account">Settlement account</label><select id="modal-settle-account">${St(String(t?.destinationAccountId||""),!1)}</select></div>
      ${Re("settleIncome")}
    </div>
  `}function yi(){const e=z.getFinancialReadModel(),t=z.getFinancialSnapshot(),n=z.getReviewState(),a=e.fiatAccounts||[],o=[["unresolvedItems","1. Resolve unclear items",t.attentionQueue?t.attentionQueue.filter(d=>d.type==="Needs review").length===0:!0,"Categorize or clarify any ambiguous transactions."],["matchPayments","2. Match payments",!0,"Link incoming cash to expected invoices."],["confirmObligations","3. Confirm obligations",t.attentionQueue?t.attentionQueue.filter(d=>d.type==="Due soon"||d.type==="Overdue").length===0:!0,"Mark due costs as paid or deferred."],["reviewSignals","4. Review signals",Number(t.runwayMonths)>=3,"Inspect runway, low points, and missing inputs."],["closeMonth","5. Close month",!0,"Lock the prior month and reset operating cycle."]];return`
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
        ${o.map(([d,l,u,y])=>`
          <label class="review-row ${u?"is-complete":""}">
            <input id="modal-review-${d}" type="checkbox" />
            <span><strong>${l}</strong><small>${y}</small></span>
          </label>
        `).join("")}
        </div>
      </div>
      <div class="form-group"><label for="modal-review-notes">Review notes</label><textarea id="modal-review-notes" rows="3" placeholder="What changed, what needs attention?">${D(n.notes)}</textarea></div>
      <p class="modal-copy">Last reviewed: ${n.lastReviewedAt?It(n.lastReviewedAt):"Not reviewed yet"}</p>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Later</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="completeWeeklyReview">Mark review complete</button>
      </div>
    </div>
  `}function wi(){const e=z.getGoalProgress();return`
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
  `}function Si(e=""){const t=z.getGoals().goals.find(a=>a.id===e),n=z.getFinancialReadModel().fiatAccounts||[];return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit goal":"Add savings goal"}</h2>
      <p class="modal-copy">Link one or more cash accounts. Their balances become this goal's live progress.</p>
      <input id="modal-goal-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-goal-name">Goal name</label><input id="modal-goal-name" value="${D(t?.name||"")}" placeholder="Emergency buffer" /></div>
        <div class="form-group"><label for="modal-goal-type">Goal type</label><select id="modal-goal-type"><option value="buffer"${t?.type==="buffer"?" selected":""}>Buffer</option><option value="savings"${t?.type==="savings"?" selected":""}>Savings</option></select></div>
        <div class="form-group"><label for="modal-goal-target">Target amount</label><input id="modal-goal-target" type="number" step="0.01" min="0.01" value="${D(t?.targetAmount||"")}" /></div>
        <div class="form-group"><label for="modal-goal-date">Target date</label><input id="modal-goal-date" type="date" value="${D(t?.targetDate||"")}" /></div>
        <div class="form-group"><label for="modal-goal-scope">Scope</label><select id="modal-goal-scope">${ft(t?.scope||"shared")}</select></div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Linked cash accounts</div>
        <div class="goal-account-grid">
          ${n.length?n.map((a,o)=>`
            <label class="settings-check goal-account-check">
              <input id="modal-goal-account-${o}" type="checkbox" value="${D(a.id)}"${t?.linkedAccountIds.includes(String(a.id))?" checked":""} />
              <span>${D(a.name)} · ${De(a.balance)}</span>
            </label>
          `).join(""):'<div class="fin-compact-empty">Add a cash account before linking progress.</div>'}
        </div>
      </div>
      ${Re("goal",!!t)}
    </div>
  `}function Ai(){const e=!!Ge,t=!!ze,n=ze?.rows||[],a=ze?.rejected||[],o=ze?.duplicates||[];return`
    <div class="modal-form">
      <h2 id="modal-title">Import transactions from CSV</h2>
      <p class="modal-copy">Choose a local transaction CSV or paste CSV data. Map a signed amount column, or separate debit and credit columns, before importing.</p>
      <div class="csv-source-grid">
        <div class="form-group">
          <label for="modal-csv-file">CSV file</label>
          <div class="csv-file-actions">
            <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseCsvImport">Choose CSV file</button>
            <span>${D(Tn)}</span>
          </div>
          <input id="modal-csv-file" type="file" accept=".csv,text/csv,text/plain" hidden />
        </div>
        <div class="form-group">
          <label for="modal-csv-account">Destination account</label>
          <select id="modal-csv-account">${St(sn,!1)}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="modal-csv-text">CSV data</label>
        <textarea id="modal-csv-text" rows="7" placeholder="date,description,amount,category,scope">${D(qt)}</textarea>
      </div>
      ${e?`
        <div class="modal-section">
          <div class="ui-title">Detected columns · ${ci(Ge?.delimiter||",")} separated</div>
          <div class="csv-columns">${Ge?.headers.map(d=>`<code>${D(d)}</code>`).join("")}</div>
          <div class="csv-mapping-grid">
            <div class="form-group"><label for="modal-csv-map-date">Date *</label><select id="modal-csv-map-date">${_t(dt.date,"Choose date column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-description">Description *</label><select id="modal-csv-map-description">${_t(dt.description,"Choose description column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-amount">Signed amount</label><select id="modal-csv-map-amount">${_t(dt.amount)}</select></div>
            <div class="form-group"><label for="modal-csv-map-debit">Debit</label><select id="modal-csv-map-debit">${_t(dt.debit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-credit">Credit</label><select id="modal-csv-map-credit">${_t(dt.credit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-category">Category</label><select id="modal-csv-map-category">${_t(dt.category)}</select></div>
            <div class="form-group"><label for="modal-csv-map-scope">Scope</label><select id="modal-csv-map-scope">${_t(dt.scope)}</select></div>
            <div class="form-group"><label for="modal-csv-default-category">Default category</label><input id="modal-csv-default-category" value="${D(pn)}" /></div>
            <div class="form-group"><label for="modal-csv-default-scope">Default scope</label><select id="modal-csv-default-scope">${ft(fn)}</select></div>
          </div>
        </div>
      `:""}
      ${wt?`<div class="fin-compact-empty" role="alert">${D(wt)}</div>`:""}
      ${t?`
        <div class="modal-section">
          <div class="ui-title">Import preview</div>
          <div class="csv-preview-counts">
            <span>${n.length} accepted</span>
            <span>${o.length} duplicate${o.length===1?"":"s"}</span>
            <span>${a.length} rejected</span>
          </div>
          ${n.slice(0,6).map(d=>`<div class="modal-list-row"><span>${D(d.description)}<br><small>${D(d.date)} · ${D(d.categoryId)} · ${D(d.scope)}</small></span><span class="${d.amount>=0?"fin-val-pos":"fin-val-neg"}">${De(d.amount)}</span></div>`).join("")}
          ${o.length?`<div class="csv-validation-list"><strong>Duplicates skipped</strong>${o.slice(0,4).map(d=>`<span>${D(d.date)} · ${D(d.description)}</span>`).join("")}</div>`:""}
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
  `}function Ii(){const e=Zt,t=e?.counts||{},n=e?.warnings||[];return`
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
          <div><span>Exported</span><strong>${It(e.exportedAt)}</strong></div>
          <div><span>Latest event</span><strong>${It(e.latestLocalEventAt)}</strong></div>
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
  `}function St(e="",t=!0){const n=z.getFinancialReadModel().fiatAccounts||[];return!n.length&&!t?'<option value="">Operating cash (created on save)</option>':`${t?'<option value="">All accounts</option>':'<option value="">Choose an account</option>'}${n.map(o=>`
    <option value="${D(o.id)}"${String(o.id)===e?" selected":""}>${D(o.name)} · ${D(o.scope||"shared")}</option>
  `).join("")}`}function $i(e=""){const t=(z.getFinancialReadModel().pipelineDeals||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit income":"Add income"}</h2>
      <p class="modal-copy">Use status to separate reality from hope: confirmed, expected, or risky.</p>
      <input id="modal-income-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-income-title">Source</label><input id="modal-income-title" value="${D(t?.title||"")}" placeholder="Client or opportunity" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-income-amount">Amount</label><input id="modal-income-amount" type="number" step="0.01" value="${D(t?.value||"")}" /></div>
        <div class="form-group"><label for="modal-income-probability">Probability</label><input id="modal-income-probability" type="number" min="0" max="1" step="0.05" value="${D(t?.probability??.65)}" /></div>
        <div class="form-group"><label for="modal-income-date">Expected date</label><input id="modal-income-date" type="date" value="${D(t?.expectedDateISO||ut())}" /></div>
        <div class="form-group"><label for="modal-income-status">Status</label><select id="modal-income-status">${["confirmed","expected","risky"].map(n=>`<option${t?.status===n?" selected":""}>${n}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-scenario">Scenario Inclusion</label><select id="modal-income-scenario">${["realistic","conservative","optimistic","all"].map(n=>`<option${(t?.scenarioInclusion||"realistic")===n?" selected":""}>${n}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-scope">Scope</label><select id="modal-income-scope">${ft(String(t?.scope||"business"))}</select></div>
      </div>
      <div class="form-group"><label for="modal-income-account">Settlement account</label><select id="modal-income-account">${St(String(t?.destinationAccountId||""))}</select></div>
      ${Re("income",!!t)}
    </div>
  `}function Di(e=""){const t=(z.getFinancialReadModel().fiatAccounts||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit cash account":"Add cash account"}</h2>
      <input id="modal-fiat-id" type="hidden" value="${D(t?.id||"")}" />
      <div class="form-group"><label for="modal-fiat-name">Name</label><input id="modal-fiat-name" value="${D(t?.name||"")}" placeholder="Operating cash" /></div>
      <div class="form-group"><label for="modal-fiat-balance">Balance</label><input id="modal-fiat-balance" type="number" step="0.01" value="${D(t?.balance||"")}" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-fiat-scope">Scope</label><select id="modal-fiat-scope">${ft(String(t?.scope||"business"))}</select></div>
        <div class="form-group"><label for="modal-fiat-bucket">Bucket</label><select id="modal-fiat-bucket">
          ${[["available","Available cash"],["tax_reserve","Tax reserve"],["vat_reserve","VAT reserve"],["health_insurance","Health insurance"],["debt_repayment","Debt repayment"],["personal_survival","Personal survival"],["business_operating_costs","Business operating costs"],["buffer","Buffer"]].map(([n,a])=>`<option value="${n}"${String(t?.bucket||"available")===n?" selected":""}>${a}</option>`).join("")}
        </select></div>
      </div>
      ${Re("fiatAccount",!!t)}
    </div>
  `}function Mi(e=""){const t=(z.getFinancialReadModel().reserveBuckets||[]).find(n=>String(n.id)===e);return`
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
  `}function Ni(){return`
    <div class="modal-form">
      <h2 id="modal-title">Allocate Cash</h2>
      <p class="modal-copy">Move available cash into reserve buckets to protect it.</p>
      <div class="modal-section">
        <div class="form-group"><label for="modal-allocate-amount">Amount</label><input id="modal-allocate-amount" type="number" step="0.01" placeholder="0.00" /></div>
        <div class="form-group"><label for="modal-allocate-bucket">To bucket</label><select id="modal-allocate-bucket">
          ${(z.getFinancialReadModel().reserveBuckets||[]).map(t=>`<option value="${D(t.id)}">${D(t.name)} (${De(t.currentAmount)} of ${De(t.targetAmount)})</option>`).join("")}
        </select></div>
      </div>
      ${Re("allocateReserves")}
    </div>
  `}function xi(e=""){const t=(z.getFinancialReadModel().recurringExpenses||[]).find(a=>String(a.id)===e);let n=t?.monthlyAmount||"";return t&&t.monthlyAmount&&(t.frequency==="quarterly"&&(n=t.monthlyAmount*3),t.frequency==="semi-annually"&&(n=t.monthlyAmount*6),t.frequency==="annually"&&(n=t.monthlyAmount*12)),`
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
        <div class="form-group"><label for="modal-expense-scope">Scope</label><select id="modal-expense-scope">${ft(String(t?.scope||"personal"))}</select></div>
      </div>
      <label class="settings-check"><input id="modal-expense-essential" type="checkbox"${t?.essential?" checked":""} /><span>Essential expense</span></label>
      <div class="modal-actions">${ia("deactivateRecurringExpense",!!t)}<span class="modal-actions-spacer"></span>${Re("expense",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function Ci(e,t=""){const n=z.getFinancialReadModel().debtAccounts||[];if(e==="debtPayment")return n.length?`
      <div class="modal-form">
        <h2 id="modal-title">Record debt payment</h2>
        <div class="form-group"><label for="modal-debt-payment-id">Debt</label><select id="modal-debt-payment-id">${n.map(o=>`<option value="${D(o.id)}">${D(o.name)} (${De(o.outstanding)})</option>`).join("")}</select></div>
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
      `;const a=n.find(o=>String(o.id)===t);return`
    <div class="modal-form">
      <h2 id="modal-title">${a?"Add to debt":"Add debt"}</h2>
      <input id="modal-debt-id" type="hidden" value="${D(a?.id||"")}" />
      <div class="form-group"><label for="modal-debt-name">Name</label><input id="modal-debt-name" value="${D(a?.name||"")}" placeholder="Credit line" /></div>
      <div class="form-group"><label for="modal-debt-amount">${a?"Additional amount":"Amount"}</label><input id="modal-debt-amount" type="number" step="0.01" /></div>
      <div class="form-group"><label for="modal-debt-scope">Scope</label><select id="modal-debt-scope">${ft(String(a?.scope||"business"))}</select></div>
      <div class="modal-actions">${ia("deactivateDebtAccount",!!a)}<span class="modal-actions-spacer"></span>${Re("debtAdd",!!a).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function ra(e){return((z.computeFinanceContext(!0).treasury||{}).obligations||[]).find(n=>String(n.id||"")===String(e||""))||null}function Fi(e=""){const t=ra(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark obligation paid</h2>
      <p class="modal-copy">${D(t?.title||"Obligation")} · ${De(t?.amount)} · due ${It(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-obligation-account">Paid from account</label><select id="modal-obligation-account">${St("",!1)}</select></div>
        <div class="form-group"><label for="modal-obligation-paid-at">Payment date</label><input id="modal-obligation-paid-at" type="date" value="${D(String(t?.dueDate||ut()).slice(0,10))}" /></div>
        <div class="form-group"><label for="modal-obligation-amount">Amount</label><input id="modal-obligation-amount" type="number" step="0.01" value="${D(t?.amount||"")}" /></div>
      </div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Optional note for the review trail"></textarea></div>
      ${Re("obligationPayment")}
    </div>
  `}function Ei(e=""){const t=ra(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Defer obligation</h2>
      <p class="modal-copy">${D(t?.title||"Obligation")} · current due date ${It(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-obligation-deferred-until">New due date</label><input id="modal-obligation-deferred-until" type="date" value="${ut()}" /></div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Why is this deferred?"></textarea></div>
      ${Re("obligationDefer")}
    </div>
  `}function sa(e){return(z.getFinancialReadModel().transactions||[]).find(t=>String(t.id)===String(e||"")||String(t.transactionEntityId||"")===String(e||""))||null}function ki(e=""){return`<option value="">Choose obligation</option>${((z.computeFinanceContext(!0).treasury||{}).obligations||[]).filter(n=>String(n.status||"")!=="paid"&&String(n.type||"")!=="debt").map(n=>`
    <option value="${D(n.id)}"${String(n.id)===e?" selected":""}>${D(n.title)} · ${It(n.dueDate)} · ${De(n.amount)}</option>
  `).join("")}`}function Ti(e=""){const t=sa(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Categorize transaction</h2>
      <p class="modal-copy">${D(t?.description||"Transaction")} · ${De(t?.amount)} · ${It(t?.timestamp)}</p>
      <input id="modal-review-transaction-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-transaction-category">Category</label><input id="modal-review-transaction-category" value="${D(t?.categoryId==="uncategorized"?"":t?.categoryId||"")}" placeholder="software, tax, client-income" /></div>
        <div class="form-group"><label for="modal-review-transaction-scope">Scope</label><select id="modal-review-transaction-scope">${ft(String(t?.scope||"business"))}</select></div>
      </div>
      <div class="form-group"><label for="modal-review-transaction-notes">Review note</label><textarea id="modal-review-transaction-notes" rows="2" placeholder="Optional note for why this is clear"></textarea></div>
      ${Re("transactionReview")}
    </div>
  `}function Oi(e=""){const t=sa(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Match payment to obligation</h2>
      <p class="modal-copy">${D(t?.description||"Payment")} · ${De(t?.amount)} · ${It(t?.timestamp)}</p>
      <input id="modal-match-transaction-id" type="hidden" value="${D(e)}" />
      <div class="form-group"><label for="modal-match-obligation-id">Obligation</label><select id="modal-match-obligation-id">${ki("")}</select></div>
      <div class="form-group"><label for="modal-match-notes">Review note</label><textarea id="modal-match-notes" rows="2" placeholder="Optional note for the match"></textarea></div>
      ${Re("paymentMatch")}
    </div>
  `}function Ri(e=""){const t=(z.getFinancialReadModel().pipelineDeals||[]).find(a=>String(a.id)===e),n=String(t?.status||"expected").toLowerCase();return`
    <div class="modal-form">
      <h2 id="modal-title">Review pipeline item</h2>
      <p class="modal-copy">${D(t?.title||"Pipeline item")} · ${De(t?.value)}</p>
      <input id="modal-pipeline-review-id" type="hidden" value="${D(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-pipeline-review-status">Status</label><select id="modal-pipeline-review-status">${["confirmed","expected","risky"].map(a=>`<option value="${a}"${n===a?" selected":""}>${a}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-pipeline-review-probability">Probability</label><input id="modal-pipeline-review-probability" type="number" min="0" max="1" step="0.05" value="${D(t?.probability??.65)}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-date">Expected date</label><input id="modal-pipeline-review-date" type="date" value="${D(t?.expectedDateISO||ut())}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-account">Settlement account</label><select id="modal-pipeline-review-account">${St(String(t?.destinationAccountId||""))}</select></div>
      </div>
      <div class="form-group"><label for="modal-pipeline-review-notes">Review note</label><textarea id="modal-pipeline-review-notes" rows="2" placeholder="What changed about this income?"></textarea></div>
      ${Re("pipelineReview")}
    </div>
  `}function _i(e=""){const t=(z.getFinancialReadModel().debtAccounts||[]).find(l=>String(l.id)===e),n=t?.planType||"regular",a=t?.frequency||"monthly",d=(t?.installments||[]).map((l,u)=>`
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
        <div class="form-group"><label for="modal-debt-plan-due-date">Next due date</label><input id="modal-debt-plan-due-date" type="date" value="${D(t?.dueDate||ut())}" /></div>
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
  `}function Pi(e,t=""){return e==="quickAdd"?mi():e==="transaction"?bi(t):e==="financeOverview"?vi():e==="weeklyReview"?yi():e==="goals"?wi():e==="goal"?Si(t):e==="csvImport"?Ai():e==="backupRestore"?Ii():e==="destructiveConfirm"?fi():e==="settleIncome"?hi(t):e==="income"?$i(t):e==="fiatAccount"?Di(t):e==="reserveBucket"?Mi(t):e==="allocateReserves"?Ni():e==="web3Position"||e==="defiPosition"?'<div class="modal-form"><h2 id="modal-title">Postponed</h2><p class="modal-copy">Market portfolio tracking is outside the focused treasury MVP.</p></div>':e==="expense"?xi(t):e==="debtAdd"||e==="debtPayment"?Ci(e,t):e==="obligationPayment"?Fi(t):e==="obligationDefer"?Ei(t):e==="transactionReview"?Ti(t):e==="paymentMatch"?Oi(t):e==="pipelineReview"?Ri(t):e==="debtPlan"?_i(t):'<div class="modal-form"><h2 id="modal-title">Nothing to edit</h2></div>'}function Pe(e,t={}){!Qe||!Ct||(!Qe.classList.contains("active")&&document.activeElement instanceof HTMLElement&&(Nn=document.activeElement),Qe.dataset.type=e,Qe.classList.add("active"),Qe.setAttribute("aria-hidden","false"),Ct.innerHTML=Pi(e,typeof t=="string"?t:String(t.id||"")),window.requestAnimationFrame(()=>{Ct.querySelector('[data-autofocus], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus()}))}function lt(e){en=e,Pe("destructiveConfirm")}function Ve(){!Qe||!Ct||(Qe.classList.remove("active"),Qe.setAttribute("aria-hidden","true"),Ct.innerHTML="",en=null,Nn?.focus(),Nn=null)}function Pt(e,t){try{z.appendFinanceEvent(e,{source:t}),Ve()}catch(n){ie(n instanceof Error?n.message:"Could not save this finance entry.")}}function ca(e){const t=S(`${e}-type`)||"expense",n=S(`${e}-desc`),a=Math.abs(Number(S(`${e}-amount`))),o=S(`${e}-account`),l=!((z.getFinancialReadModel().fiatAccounts||[]).length>0)&&t!=="transfer";if(!Number.isFinite(a)||a<=0||!o&&!l)return ie(l?"Add a positive amount.":"Add a positive amount and an account."),!1;try{return t==="transfer"?z.recordTransfer({description:n,amount:a,timestamp:Yn(S(`${e}-date`)),fromAccountId:o,toAccountId:S(`${e}-to-account`),categoryId:S(`${e}-category`)||"transfer",scope:S(`${e}-scope`)}):z.recordLedgerTransaction({type:t==="income"||t==="adjustment"?t:"expense",description:n,amount:a,timestamp:Yn(S(`${e}-date`)),accountId:o,categoryId:S(`${e}-category`)||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),scope:S(`${e}-scope`),direction:S(`${e}-direction`)==="decrease"?"decrease":"increase"}),Ve(),!0}catch(u){return ie(u instanceof Error?u.message:"Could not add this transaction."),!1}}function Sn(){qt=S("modal-csv-text")||qt,sn=S("modal-csv-account")||sn,pn=S("modal-csv-default-category")||pn,fn=S("modal-csv-default-scope")||fn,Ge&&(dt={date:S("modal-csv-map-date"),description:S("modal-csv-map-description"),amount:S("modal-csv-map-amount"),debit:S("modal-csv-map-debit"),credit:S("modal-csv-map-credit"),category:S("modal-csv-map-category"),scope:S("modal-csv-map-scope")})}function Bi(){const e=z.exportBackup(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=`finance-master-backup-${ut()}.json`,n.click(),z.recordBackupExport(e.exportedAt),URL.revokeObjectURL(n.href)}function Li(){const e=new Blob([z.exportTransactionsCsv()],{type:"text/csv;charset=utf-8"}),t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=`finance-master-transactions-${ut()}.csv`,t.click(),URL.revokeObjectURL(t.href)}function ji(e){const t=z.getFinanceSettings().baseCurrency,n=new Date().toISOString();if(e==="transaction"){ca("modal-fast-txn");return}if(e==="income"){const a=Number(S("modal-income-amount")),o=Number(S("modal-income-probability"));if(!S("modal-income-title")||!Number.isFinite(a)||a===0||!Number.isFinite(o)||o<0||o>1){ie("Add an income source, a non-zero amount, and a probability between 0 and 1.");return}Pt({type:"pipeline.created",amount:Math.abs(a),currency:t,timestamp:n,related_entity_id:S("modal-income-id")||on("pipeline"),metadata:{title:S("modal-income-title"),value:Math.abs(a),probability:o,status:S("modal-income-status"),stage:S("modal-income-status"),scenarioInclusion:S("modal-income-scenario")||"realistic",expectedDateISO:S("modal-income-date"),destinationAccountId:S("modal-income-account"),scope:S("modal-income-scope")}},"modal.income");return}if(e==="fiatAccount"){const a=Number(S("modal-fiat-balance"));if(!S("modal-fiat-name")||!Number.isFinite(a)){ie("Add an account name and a valid balance.");return}const o=S("modal-fiat-bucket")||"available";Pt({type:"asset.account_set",amount:a,currency:t,timestamp:n,related_entity_id:S("modal-fiat-id")||on("cash"),metadata:{name:S("modal-fiat-name"),balance:a,active:!0,scope:S("modal-fiat-scope"),bucket:o,reserved:o!=="available"}},"modal.fiatAccount");return}if(e==="reserveBucket"){const a=Number(S("modal-reserve-target")),o=Number(S("modal-reserve-current"))||0;if(!S("modal-reserve-name")||!Number.isFinite(a)){ie("Add a name and a target amount.");return}Pt({type:"asset.reserve_set",amount:a,currency:t,timestamp:n,related_entity_id:S("modal-reserve-id")||on("reserve"),metadata:{name:S("modal-reserve-name"),targetAmount:a,currentAmount:o,purpose:S("modal-reserve-purpose"),priority:S("modal-reserve-priority"),active:!0}},"modal.reserveBucket");return}if(e==="allocateReserves"){const a=Number(S("modal-allocate-amount")),o=S("modal-allocate-bucket");if(!o||!Number.isFinite(a)||a<=0){ie("Enter a valid amount to allocate.");return}const d=(z.getFinancialReadModel().reserveBuckets||[]).find(l=>String(l.id)===o);if(!d){ie("Choose an existing reserve bucket before allocating cash.");return}Pt({type:"asset.reserve_allocated",amount:a,currency:t,timestamp:n,related_entity_id:o,metadata:{currentAmount:(Number(d.currentAmount)||0)+a}},"modal.allocateReserves");return}if(e==="expense"){const a=Math.abs(Number(S("modal-expense-amount"))),o=S("modal-expense-frequency")||"monthly";let d=a;o==="quarterly"&&(d=a/3),o==="semi-annually"&&(d=a/6),o==="annually"&&(d=a/12);const l=Number(S("modal-expense-due-day"));if(!S("modal-expense-category")||!Number.isFinite(a)||a<=0||!Number.isFinite(l)||l<1||l>28){ie("Add a cost name, positive amount, and due day from 1 to 28.");return}Pt({type:"expense.recurring_set",amount:a,currency:t,timestamp:n,related_entity_id:S("modal-expense-id")||on("expense"),metadata:{category:S("modal-expense-category"),monthlyAmount:d,essential:oa("modal-expense-essential"),active:!0,dueDay:l,frequency:o,scope:S("modal-expense-scope")}},"modal.expense");return}if(e==="debtAdd"){const a=Math.abs(Number(S("modal-debt-amount")));if(!S("modal-debt-name")||!Number.isFinite(a)||a<=0){ie("Add a debt name and a positive amount.");return}Pt({type:"debt.added",amount:a,currency:t,timestamp:n,related_entity_id:S("modal-debt-id")||on("debt"),metadata:{name:S("modal-debt-name"),scope:S("modal-debt-scope")}},"modal.debtAdd");return}if(e==="debtPayment"){const a=Math.abs(Number(S("modal-debt-payment-amount")));if(!S("modal-debt-payment-id")||!Number.isFinite(a)||a<=0){ie("Choose a debt item and enter a positive payment amount.");return}Pt({type:"debt.payment_made",amount:a,currency:t,timestamp:n,related_entity_id:S("modal-debt-payment-id"),metadata:{}},"modal.debtPayment");return}if(e==="obligationPayment"){const a=Math.abs(Number(S("modal-obligation-amount")));if(!S("modal-obligation-id")||!S("modal-obligation-account")||!Number.isFinite(a)||a<=0){ie("Choose an obligation, payment account, and positive amount.");return}try{z.reviewObligation({id:S("modal-obligation-id"),status:"paid",accountId:S("modal-obligation-account"),paidAt:S("modal-obligation-paid-at"),amount:a,notes:S("modal-obligation-notes")}),Ve()}catch(o){ie(o instanceof Error?o.message:"Could not mark this obligation paid.")}return}if(e==="obligationDefer"){if(!S("modal-obligation-id")||!S("modal-obligation-deferred-until")){ie("Choose an obligation and a new due date.");return}try{z.reviewObligation({id:S("modal-obligation-id"),status:"deferred",deferredUntil:S("modal-obligation-deferred-until"),notes:S("modal-obligation-notes")}),Ve()}catch(a){ie(a instanceof Error?a.message:"Could not defer this obligation.")}return}if(e==="transactionReview"){if(!S("modal-review-transaction-id")||!S("modal-review-transaction-category")){ie("Choose a transaction category before clearing this item.");return}try{z.reviewTransaction({id:S("modal-review-transaction-id"),categoryId:S("modal-review-transaction-category"),scope:S("modal-review-transaction-scope"),notes:S("modal-review-transaction-notes")}),Ve()}catch(a){ie(a instanceof Error?a.message:"Could not categorize this transaction.")}return}if(e==="paymentMatch"){if(!S("modal-match-transaction-id")||!S("modal-match-obligation-id")){ie("Choose a payment and an obligation to match.");return}try{z.matchTransactionToObligation({transactionId:S("modal-match-transaction-id"),obligationId:S("modal-match-obligation-id"),notes:S("modal-match-notes")}),Ve()}catch(a){ie(a instanceof Error?a.message:"Could not match this payment.")}return}if(e==="pipelineReview"){const a=Number(S("modal-pipeline-review-probability"));if(!S("modal-pipeline-review-id")||!S("modal-pipeline-review-date")||!Number.isFinite(a)||a<0||a>1){ie("Choose a pipeline item, expected date, and probability between 0 and 1.");return}try{z.updatePipelineReview({id:S("modal-pipeline-review-id"),status:S("modal-pipeline-review-status"),probability:a,expectedDateISO:S("modal-pipeline-review-date"),destinationAccountId:S("modal-pipeline-review-account"),notes:S("modal-pipeline-review-notes")}),Ve()}catch(o){ie(o instanceof Error?o.message:"Could not update this pipeline item.")}return}if(e==="debtPlan"){const a=S("modal-debt-plan-type")||"regular",o=S("modal-debt-plan-frequency"),d=Number(S("modal-debt-plan-minimum")),l=S("modal-debt-plan-due-date"),u=S("modal-debt-plan-note"),y=[];if(a==="custom"){const b=document.querySelectorAll(".modal-debt-plan-inst-date"),A=document.querySelectorAll(".modal-debt-plan-inst-amount");for(let w=0;w<b.length;w++)b[w].value&&Number(A[w].value)>0&&y.push({date:b[w].value,amount:Number(A[w].value)});if(y.length===0){ie("Add at least one valid installment for a custom plan.");return}}else if(!l||!Number.isFinite(d)||d<=0){ie("Add a due date and positive minimum payment.");return}if(!S("modal-debt-plan-id")){ie("Invalid debt ID.");return}try{z.saveDebtPlan({id:S("modal-debt-plan-id"),dueDate:l||y[0]?.date||new Date().toISOString(),minimumPayment:d||y[0]?.amount||0,paymentPlanNote:u,planType:a,frequency:o,installments:y}),Ve()}catch(b){ie(b instanceof Error?b.message:"Could not save this debt plan.")}return}if(e==="goal"){try{z.saveGoal({id:S("modal-goal-id")||void 0,name:S("modal-goal-name"),type:S("modal-goal-type")==="savings"?"savings":"buffer",targetAmount:Number(S("modal-goal-target")),targetDate:S("modal-goal-date")||void 0,scope:S("modal-goal-scope"),linkedAccountIds:[...document.querySelectorAll('[id^="modal-goal-account-"]:checked')].map(a=>a.value)}),Pe("goals")}catch(a){ie(a instanceof Error?a.message:"Could not save this goal.")}return}if(e==="settleIncome"){if(!S("modal-settle-account")){ie("Choose a settlement account before marking this item as paid.");return}try{z.markPipelineItemPaid(S("modal-settle-id"),{destinationAccountId:S("modal-settle-account")}),Ve()}catch(a){ie(a instanceof Error?a.message:"Could not mark this income as paid.")}}}function Ui(e){const t=[];return e.replace(/'((?:\\.|[^'])*)'/g,(n,a)=>(t.push(a.replace(/\\'/g,"'").replace(/\\\\/g,"\\")),"")),t}function qi(e){const t=e.split(".").reduce((n,a)=>!n||typeof n!="object"?null:n[a],window);return typeof t=="function"?t:null}function An(e,t){const n=S(t);n&&lt({action:e,targetId:n,title:"Deactivate item",copy:"This archives the selected item from active finance calculations while keeping the event history.",phrase:"DEACTIVATE ITEM",buttonLabel:"Deactivate item"})}Object.assign(window,{openEditModal:Pe,requestDestructiveConfirmation:lt,closeModal:Ve,saveFinanceModal:ji,addTransaction:()=>{ca("modal-txn")&&Pe("financeOverview")},refreshTransactionsModal:()=>{ee.search=S("modal-filter-search"),ee.accountId=S("modal-filter-account"),ee.scope=S("modal-filter-scope")||"all",ee.categoryId=S("modal-filter-category"),ee.type=S("modal-filter-type")||"all",ee.reviewStatus=S("modal-filter-review-status")||"all",ee.dateFrom=S("modal-filter-date-from"),ee.dateTo=S("modal-filter-date-to"),Pe("financeOverview")},deleteTransaction:e=>{e&&lt({action:"reverseTransaction",targetId:e,source:"modal.transaction.reverse",title:"Reverse transaction",copy:"This reverses the transaction and its linked account balance update.",phrase:"REVERSE TRANSACTION",buttonLabel:"Reverse transaction",reopenModal:"financeOverview"})},markAsPaid:e=>{Pe("settleIncome",{id:e})},deleteInvoice:e=>{if(!e)return;const t=(z.getFinancialReadModel().invoices||[]).find(n=>String(n.id)===e);lt({action:"deleteInvoice",targetId:e,reverseSettlement:String(t?.status||"").toLowerCase()==="paid",title:"Archive income entry",copy:"This archives the selected pipeline or settlement entry. If it is settled, the linked settlement can be reversed as part of the archive.",phrase:"ARCHIVE INCOME ENTRY",buttonLabel:"Archive entry"})},markObligationNeedsReview:e=>{try{z.reviewObligation({id:e,status:"needs_review"})}catch(t){window.alert(t instanceof Error?t.message:"Could not update this obligation.")}},cancelPipelineFromReview:e=>{e&&lt({action:"cancelPipelineItem",targetId:e,source:"Cancelled during Review.",title:"Cancel pipeline item",copy:"This removes the selected pipeline item from expected income and forecast assumptions.",phrase:"CANCEL PIPELINE ITEM",buttonLabel:"Cancel pipeline item",renderAfter:!0})},toggleDebtPlanType:e=>{const t=document.getElementById("modal-debt-plan-regular-section"),n=document.getElementById("modal-debt-plan-custom-section");t&&(t.style.display=e==="regular"?"block":"none"),n&&(n.style.display=e==="custom"?"block":"none")},addCustomInstallment:()=>{const e=document.getElementById("modal-debt-plan-custom-list");if(!e)return;const t=e.children.length,n=document.createElement("div");n.className="custom-installment-row modal-grid-two",n.style.cssText="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;",n.dataset.index=String(t),n.innerHTML=`
      <input type="date" class="modal-debt-plan-inst-date" value="${ut()}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" placeholder="Amount" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    `,e.appendChild(n)},deactivateFiatAccount:()=>An("deactivateFiatAccount","modal-fiat-id"),deactivateRecurringExpense:()=>An("deactivateRecurringExpense","modal-expense-id"),deactivateDebtAccount:()=>An("deactivateDebtAccount","modal-debt-id"),resetDemoData:()=>{lt({action:"resetDemoData",title:"Restore sample data",copy:"This replaces the current local Finance Master ledger with the fictional sample data.",phrase:"RESTORE SAMPLE DATA",buttonLabel:"Restore sample data"})},deleteDemoData:()=>{lt({action:"deleteDemoData",title:"Delete sample data",copy:"This clears the fictional sample ledger from this browser. Your dashboard will be empty until you add entries or restore a backup.",phrase:"DELETE SAMPLE DATA",buttonLabel:"Delete sample data"})},resetLocalFinanceData:()=>{lt({action:"resetLocalFinanceData",title:"Reset local finance data",copy:"This clears only Finance Master local finance data in this browser, including ledger events, settings, review state, import history, goals, and cached local values.",phrase:"DELETE LOCAL FINANCE DATA",buttonLabel:"Reset local data"})},completeWeeklyReview:()=>{const e=[...document.querySelectorAll(".review-account-check")],t=["modal-review-unresolvedItems","modal-review-matchPayments","modal-review-confirmObligations","modal-review-reviewSignals","modal-review-closeMonth"];if(!e.length||e.some(a=>!a.checked)||t.some(a=>!oa(a))){ie("Confirm every account balance and complete each operating check before finishing the review.");return}const n=e.map((a,o)=>({accountId:a.dataset.accountId||"",rawBalance:S(`modal-review-balance-${o}`)}));if(n.some(a=>!a.rawBalance||!Number.isFinite(Number(a.rawBalance)))){ie("Add a valid balance for every reconciled account.");return}try{z.completeWeeklyReview({accounts:n.map(a=>({accountId:a.accountId,balance:Number(a.rawBalance)})),unresolvedItems:!0,matchPayments:!0,confirmObligations:!0,reviewSignals:!0,closeMonth:!0,notes:S("modal-review-notes")}),Ve()}catch(a){ie(a instanceof Error?a.message:"Could not complete this review.")}},deleteGoal:e=>{e&&lt({action:"deleteGoal",targetId:e,title:"Delete savings goal",copy:"This deletes the selected savings or buffer goal. It does not delete linked account balances.",phrase:"DELETE SAVINGS GOAL",buttonLabel:"Delete goal",reopenModal:"goals"})},exportFinanceBackup:()=>Bi(),exportTransactionsCsv:()=>Li(),chooseFinanceBackup:()=>document.querySelector("#modal-backup-file")?.click(),undoImportBatch:e=>{e&&lt({action:"undoImportBatch",targetId:e,title:"Undo CSV import",copy:"This reverses the transactions imported in the selected CSV batch.",phrase:"UNDO CSV IMPORT",buttonLabel:"Undo import",renderAfter:!0})},chooseCsvImport:()=>document.querySelector("#modal-csv-file")?.click(),analyzeCsvImport:()=>{try{Sn(),Ge=Mn(qt),dt=aa(Ge.headers),ze=null,wt="",Pe("csvImport")}catch(e){Ge=null,ze=null,wt=e instanceof Error?e.message:"Could not parse this CSV.",Pe("csvImport")}},previewCsvImport:()=>{try{Sn(),Ge||(Ge=Mn(qt));const e=z.getActiveFinanceEvents().map(t=>String(t.metadata?.fingerprint||"")).filter(Boolean);ze=si(Ge,dt,{existingFingerprints:e,defaultCategory:pn,defaultScope:fn,sourceFile:Tn}),wt="",Pe("csvImport")}catch(e){ze=null,wt=e instanceof Error?e.message:"Could not preview this CSV.",Pe("csvImport")}},importCsvData:()=>{if(Sn(),!sn){ie("Choose a destination account before importing.");return}if(!ze?.rows.length){ie("Preview at least one valid, non-duplicate row before importing.");return}try{const e=z.importCsvTransactions(ze.rows,{accountId:sn,sourceFile:ze.sourceFile});wt=`Imported ${e.imported} row${e.imported===1?"":"s"}${e.duplicates?` · skipped ${e.duplicates} duplicate${e.duplicates===1?"":"s"}`:""}.`,ze=null,Pe("csvImport")}catch(e){ie(e instanceof Error?e.message:"Could not import this CSV.")}},applyBackupRestore:()=>{if(!Zt?.valid||!Lt){ie("Choose a valid Finance Master backup before restoring.");return}lt({action:"restoreBackup",title:"Replace local finance data",copy:"This replaces the current local Finance Master data in this browser with the selected backup.",phrase:"RESTORE LOCAL FINANCE DATA",buttonLabel:"Replace current data"})},applyDestructiveConfirmation:()=>{const e=en;if(!e){ie("Choose an action before confirming.");return}if(S("modal-destructive-phrase")!==e.phrase){ie("The confirmation phrase does not match.");return}try{if(e.action==="restoreBackup"){if(!Zt?.valid||!Lt)throw new Error("Choose a valid Finance Master backup before restoring.");z.restoreBackup(Lt),Lt=null,Zt=null}else if(e.action==="resetLocalFinanceData")z.resetLocalFinanceData();else if(e.action==="resetDemoData")z.clearAndReseedDemo();else if(e.action==="deleteDemoData")z.deleteSampleData();else if(e.action==="deactivateFiatAccount"||e.action==="deactivateRecurringExpense"||e.action==="deactivateDebtAccount"){if(!e.targetId)throw new Error("Choose an item before deactivating.");z[e.action](e.targetId)}else if(e.action==="reverseTransaction"){if(!e.targetId)throw new Error("Choose a transaction before reversing.");z.reverseTransaction(e.targetId,e.source||"modal.transaction.reverse")}else if(e.action==="deleteInvoice"){if(!e.targetId)throw new Error("Choose an income entry before archiving.");z.deleteInvoice(e.targetId,{reverseSettlement:e.reverseSettlement===!0})}else if(e.action==="cancelPipelineItem"){if(!e.targetId)throw new Error("Choose a pipeline item before cancelling.");z.cancelPipelineItem(e.targetId,e.source||"Cancelled.")}else if(e.action==="deleteGoal"){if(!e.targetId)throw new Error("Choose a goal before deleting.");z.deleteGoal(e.targetId)}else if(e.action==="undoImportBatch"){if(!e.targetId)throw new Error("Choose an import batch before undoing.");z.undoImportBatch(e.targetId)}const t=e.reopenModal,n=e.renderAfter===!0;kn(z),Ve(),t&&Pe(t),(n||!t)&&window.FinancialMode?.render?.()}catch(t){ie(t instanceof Error?t.message:"Could not complete this action.")}}});document.addEventListener("click",e=>{const t=e.target?.closest("[data-action]");if(!t)return;const n=t.dataset.action;n&&(e.preventDefault(),qi(n)?.(...Ui(t.dataset.actionArgs||"")))});Qe?.addEventListener("click",e=>{e.target===Qe&&Ve()});document.addEventListener("keydown",e=>{if(!Qe?.classList.contains("active"))return;if(e.key==="Escape"){Ve();return}if(e.key!=="Tab")return;const t=[...Qe.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(o=>o.offsetParent!==null);if(!t.length)return;const n=t[0],a=t[t.length-1];Qe.contains(document.activeElement)?e.shiftKey&&document.activeElement===n?(e.preventDefault(),a.focus()):!e.shiftKey&&document.activeElement===a&&(e.preventDefault(),n.focus()):(e.preventDefault(),(e.shiftKey?a:n).focus())});document.addEventListener("input",e=>{e.target?.id==="modal-destructive-phrase"&&gi()});document.addEventListener("change",e=>{const t=e.target;if(!t?.files?.[0])return;const n=new FileReader;if(t.id==="modal-csv-file"){n.onload=()=>{try{qt=String(n.result||""),Tn=t.files?.[0]?.name||"imported-transactions.csv",Ge=Mn(qt),dt=aa(Ge.headers),ze=null,wt="",Pe("csvImport")}catch(a){Ge=null,ze=null,wt=a instanceof Error?a.message:"Could not parse this CSV file.",Pe("csvImport")}},n.readAsText(t.files[0]);return}t.id==="modal-backup-file"&&(n.onload=()=>{try{Lt=JSON.parse(String(n.result||"")),Zt=z.previewBackup(Lt)}catch(a){Lt=null,Zt={valid:!1,counts:{},errors:[a instanceof Error?a.message:"Could not read this backup."]}}Pe("backupRestore")},n.readAsText(t.files[0]))});function zi(e,t){const n={ledger:{title:"Transactions",copy:"Clean daily view, focused review work, and raw audit evidence when you need it.",sections:["ledger"]},invoices:{title:"Income",copy:"Expected, confirmed, overdue, and settled income separated from real cash.",sections:["invoices"]},planning:{title:"Cashflow",copy:"Baseline, expected month, and conservative or optimistic scenarios for the next decisions.",sections:["scenarioOutcomes","cashCalendar","pipelineTabs","goals","projection","scenarioLab"]},review:{title:"Monthly Review",copy:"Resolve unclear items, reconcile accounts, and close the operating loop.",sections:["reviewQueue","obligationReview","paymentReview","tensionSignals","weeklyReview"]},reports:{title:"Reports",copy:"Patterns across cash rhythm, reserves, income concentration, and financial health.",sections:["reports"]},data:{title:"Import & Backup",copy:"Local imports, backups, import batches, and sample ledger controls.",sections:["data"]},settings:{title:"Settings",copy:"System preferences and local display controls.",sections:["settings"]},reserves:{title:"Reserves",copy:"Protected cash, reserve buckets, and allocation between available and spoken-for money.",sections:["reserves"]},fixedCosts:{title:"Obligations",copy:"Recurring obligations, minimum payments, and debt plans that shape monthly burn.",sections:["fixedCosts"]}};return function(o){const d=n[o];return d?[t(d.title,d.copy),...d.sections.map(l=>e[l]())]:['<div class="fin-dashboard-main">',t("Overview","Your local-first treasury cockpit."),e.observatoryHeader(),e.dashboardCockpit(),e.attentionQueue(),e.next30Days(),e.strategicPicture(),"</div>"]}}function U(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ye(e){return String(e??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}function dn(e,t,n){const a=Number(e)||0;return`${a} ${a===1?t:n||`${t}s`}`}function Qn(e){return[["all","All scopes"],["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function qe(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"Not yet"}function Ie(e){return`<div class="fin-compact-empty">${U(e)}</div>`}function Vi(e){const t=String(e||"").replace(/_/g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Review"}function Nt(e){const t=String(e||"needs_review").toLowerCase();return`<span class="fin-status-pill fin-status-pill--${U(t)}">${U(Vi(t))}</span>`}function Gi(e,t){return`
        <section class="fin-section fin-section-heading">
            <div class="fin-page-header">
                <h2 class="fin-page-title">${U(e)}</h2>
                <p class="fin-page-subtitle">${U(t)}</p>
            </div>
        </section>
    `}window.FinancialMode=(function(){let e=null,t=null,n=null,a=null,o=null,d=null,l={},u=!1,y={marketMajors:0,burnDelta:0,probFloor:50},b=!1;const A={focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",ledgerView:"finance-master.layout.ledger-view",ledgerFilters:"finance-master.layout.ledger-filters",invoicesView:"finance-master.layout.invoices-view",activeSection:"finance-master.layout.active-section"},w=["dashboard","ledger","invoices","planning","review","reports","data","settings","reserves","fixedCosts"],W={today:"dashboard",transactions:"ledger",income:"invoices",invoices:"invoices",cashflow:"planning",planning:"planning",import:"data",obligations:"fixedCosts",fixedcosts:"fixedCosts",fixedCosts:"fixedCosts"},V={container:document.getElementById("dashboard-financial"),content:document.getElementById("fin-content-area"),switchBtns:document.querySelectorAll(".fin-switch-btn"),mobileNavToggle:document.querySelector('[data-action="FinancialMode.toggleMobileNav"]'),sidebar:document.querySelector(".finance-master-sidebar")};function h(c){return`finance-master.layout.collapsed.${String(c||"").trim()}`}function v(c,r){try{const f=localStorage.getItem(c);if(f==null)return!!r;if(f==="true")return!0;if(f==="false")return!1}catch{}return!!r}function M(c,r){try{localStorage.setItem(c,r?"true":"false")}catch{}}function E(c){const r=String(c||"dashboard").trim(),f=r.toLowerCase(),q=W[r]||W[f]||r;return w.indexOf(q)!==-1?q:"dashboard"}function Y(){return v(A.focusMode,!1)}function k(c){M(A.focusMode,!!c)}function F(){try{const c=String(localStorage.getItem(A.pipelineTab)||"pipeline").toLowerCase();if(c==="pipeline"||c==="history"||c==="cashflow")return c}catch{}return"pipeline"}function C(c){const r=String(c||"").toLowerCase();if(!(r!=="pipeline"&&r!=="history"&&r!=="cashflow"))try{localStorage.setItem(A.pipelineTab,r)}catch{}}function R(){try{return E(localStorage.getItem(A.activeSection)||"dashboard")}catch{return"dashboard"}}function te(c){const r=E(c);try{localStorage.setItem(A.activeSection,r)}catch{}he(),m()}function de(){try{const c=String(localStorage.getItem(A.ledgerView)||"clean").toLowerCase();if(c==="clean"||c==="work"||c==="audit")return c}catch{}return"clean"}function ve(c){const r=String(c||"clean").toLowerCase();if(!(r!=="clean"&&r!=="work"&&r!=="audit"))try{localStorage.setItem(A.ledgerView,r)}catch{}}function J(){try{const c=String(localStorage.getItem(A.invoicesView)||"open").toLowerCase();if(c==="open"||c==="settled"||c==="all")return c}catch{}return"open"}function B(c){const r=String(c||"open").toLowerCase();if(!(r!=="open"&&r!=="settled"&&r!=="all"))try{localStorage.setItem(A.invoicesView,r)}catch{}}function N(){return{search:"",accountId:"all",scope:"all",categoryId:"",type:"all",reviewStatus:"all",dateFrom:"",dateTo:""}}function L(){try{const c=JSON.parse(localStorage.getItem(A.ledgerFilters)||"{}");return Object.assign(N(),c&&typeof c=="object"?c:{})}catch{return N()}}function K(c){try{localStorage.setItem(A.ledgerFilters,JSON.stringify(Object.assign(N(),c||{})))}catch{}}function oe(){try{localStorage.removeItem(A.ledgerFilters)}catch{}}function X(c){const r=re(e&&e.fiatAccounts);return[`<option value="all"${c==="all"||!c?" selected":""}>All accounts</option>`,...r.map(f=>`<option value="${U(f.id)}"${String(c)===String(f.id)?" selected":""}>${U(f.name||"Account")}</option>`)].join("")}function Ce(c){document.querySelectorAll("[data-fin-nav]").forEach(r=>{const f=String(r.getAttribute("data-fin-nav")||"")===c;r.classList.toggle("active",f),r.setAttribute("aria-current",f?"page":"false")})}function be(c){const r=!!c,f=typeof window.matchMedia=="function"?window.matchMedia("(max-width: 760px)").matches:!1;document.body.classList.toggle("finance-nav-open",r),V.mobileNavToggle&&(V.mobileNavToggle.setAttribute("aria-expanded",r?"true":"false"),V.mobileNavToggle.setAttribute("aria-label",r?"Close navigation":"Open navigation")),V.sidebar&&(f&&!r?(V.sidebar.setAttribute("aria-hidden","true"),V.sidebar.setAttribute("inert","")):(V.sidebar.removeAttribute("aria-hidden"),V.sidebar.removeAttribute("inert")))}function fe(){be(!document.body.classList.contains("finance-nav-open"))}function he(){be(!1)}function ue(c){return v(h(c),!0)}function we(c,r){M(h(c),!!r)}function re(c){return Array.isArray(c)?c:[]}function Ke(c,r={}){return typeof window.renderSAGIcon=="function"?window.renderSAGIcon(c,r):""}function j(c,r){if(!u&&(c==null||Number(c)===0)||c==null||!Number.isFinite(Number(c)))return"—";const f=window.Store&&typeof window.Store.getFinanceSettings=="function"?window.Store.getFinanceSettings().baseCurrency:"EUR";if(window.FinanceFormatting&&typeof window.FinanceFormatting.formatCurrencyAmount=="function")return window.FinanceFormatting.formatCurrencyAmount(c,{currency:r,baseCurrency:f});const $=r||f||"EUR";return new Intl.NumberFormat(void 0,{style:"currency",currency:$,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(c))}function nt(){const c=Number(t&&t.runwayMonths),r=Number(t&&t.confidenceScore),f=Array.isArray(t&&t.missingInputs)?t.missingInputs.length:0,$=String(n&&n.stressLevel||"").toLowerCase();return!u||!Number.isFinite(r)||r<.45||f>=3?{text:"Unclear",tone:"quiet",icon:"attention"}:!Number.isFinite(c)||c<4||$==="high"?{text:"Tight",tone:"fragmented",icon:"warning"}:c>=8&&$==="low"?{text:"Expanding",tone:"expanding",icon:"sprout"}:{text:"Stable",tone:"nourishing",icon:"success"}}function _e(){const c=window.FinanceLedger&&typeof window.FinanceLedger.isPipelineActive=="function"?window.FinanceLedger.isPipelineActive:function(r){const f=String(r||"").toLowerCase();return f!=="paid"&&f!=="closed"&&f!=="lost"&&f!=="cancelled"&&f!=="deleted"};return re(e&&e.pipelineDeals).filter(r=>c(r&&r.status))}function Ee(){const c=re(e&&e.invoices).filter(p=>String(p&&p.status||"").toLowerCase()==="paid"),r=[];for(let p=5;p>=0;p-=1){const O=new Date;O.setMonth(O.getMonth()-p);const x=`${O.getFullYear()}-${String(O.getMonth()+1).padStart(2,"0")}`;r.push({key:x,label:O.toLocaleDateString(void 0,{month:"short"}),income:0,expense:0})}const f=new Map(r.map(p=>[p.key,p]));c.forEach(p=>{const O=Date.parse(p&&p.paidAt||p&&p.sentAt||"");if(!Number.isFinite(O))return;const x=new Date(O),ae=`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`,Ae=f.get(ae);if(!Ae)return;const $e=Math.abs(Number(p&&p.amount)||0);Ae.income+=$e});const $=r.some(p=>p.income>0||p.expense>0),q=Math.max(1,...r.map(p=>Math.max(p.income,p.expense)));return{buckets:r,hasData:$,maxValue:q}}function at(c){const r=c||Ee();if(!r.hasData)return Ie("No cashflow history. Record your first operating month to unlock rhythms.");const f=100/Math.max(1,r.buckets.length);return`
            <div class="fin-rhythm">
                <div class="fin-muted fin-rhythm-label">Cashflow Rhythm (6 months)</div>
                <div class="fin-rhythm-bars">
                    ${r.buckets.map($=>{const q=$.income>0?Math.max(2,$.income/r.maxValue*100):0,p=$.expense>0?Math.max(2,$.expense/r.maxValue*100):0;return`
                            <div class="fin-rhythm-month">
                                <div class="fin-rhythm-columns" style="--rhythm-width:${f}%">
                                    <span class="fin-rhythm-bar fin-rhythm-income" style="height:${q}%"></span>
                                    <span class="fin-rhythm-bar fin-rhythm-expense" style="height:${p}%"></span>
                                </div>
                                <span class="fin-rhythm-month-label">${$.label}</span>
                            </div>
                        `}).join("")}
                </div>
            </div>
        `}function it(){if(console.log("[FinancialMode] Initializing..."),window.Store&&typeof window.Store.getUiSettings=="function"){const c=window.Store.getUiSettings().scenario||{};y={marketMajors:Number(c.marketMajors)||0,burnDelta:Number(c.burnDelta)||0,probFloor:Number.isFinite(Number(c.probFloor))?Number(c.probFloor):50}}gt(),window.addEventListener("mode-changed",c=>{c.detail.mode==="financial"&&m()}),window.addEventListener("finance:updated",m),window.addEventListener("resize",()=>{be(document.body.classList.contains("finance-nav-open"))}),document.addEventListener("keydown",c=>{c.key==="Escape"&&he()}),he(),m()}function gt(){!V.content||V.content.dataset.finUiBound==="1"||(V.content.dataset.finUiBound="1",V.content.addEventListener("click",c=>{const r=c.target.closest("[data-fin-action]");if(!r||!V.content.contains(r))return;const f=String(r.getAttribute("data-fin-action")||"");if(f==="toggle-focus-mode"){const $=!Y();$&&window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.saveCurrent=="function"&&window.CoreDashboardLayout.saveCurrent(),k($),m();return}if(f==="toggle-collapsible"){const $=String(r.getAttribute("data-fin-section")||"").trim();if(!$)return;we($,!ue($)),m();return}if(f==="set-tab"){const $=String(r.getAttribute("data-fin-tab")||"").trim();C($),m();return}if(f==="set-ledger-view"){const $=String(r.getAttribute("data-fin-ledger-view")||"clean").trim();ve($),m();return}if(f==="apply-ledger-filters"){K({search:String(document.getElementById("fin-ledger-search")?.value||""),accountId:String(document.getElementById("fin-ledger-account")?.value||"all"),scope:String(document.getElementById("fin-ledger-scope")?.value||"all"),categoryId:String(document.getElementById("fin-ledger-category")?.value||""),type:String(document.getElementById("fin-ledger-type")?.value||"all"),reviewStatus:String(document.getElementById("fin-ledger-review")?.value||"all"),dateFrom:String(document.getElementById("fin-ledger-date-from")?.value||""),dateTo:String(document.getElementById("fin-ledger-date-to")?.value||"")}),m();return}if(f==="clear-ledger-filters"){oe(),m();return}if(f==="reverse-ledger-transaction"){const $=String(r.getAttribute("data-fin-transaction-id")||"").trim();if(!$)return;typeof window.requestDestructiveConfirmation=="function"&&window.requestDestructiveConfirmation({action:"reverseTransaction",targetId:$,source:"ledger.page.reverse",title:"Reverse transaction",copy:"This reverses the transaction and its linked account balance update.",phrase:"REVERSE TRANSACTION",buttonLabel:"Reverse transaction",renderAfter:!0});return}if(f==="set-scenario-preset"){const $=String(r.getAttribute("data-fin-preset")||"baseline"),q={baseline:{marketMajors:0,burnDelta:0,probFloor:50},conservative:{marketMajors:-15,burnDelta:10,probFloor:35},stretch:{marketMajors:10,burnDelta:-5,probFloor:70}};y=q[$]||q.baseline,window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scenario:y}),m();return}if(f==="set-invoices-view"){const $=String(r.getAttribute("data-fin-invoices-view")||"open").trim();B($),m();return}f==="toggle-advice"&&(b=!b,m())}),V.content.addEventListener("change",c=>{const r=c.target;!r||r.id!=="fin-scope-filter"||(window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scopeFilter:String(r.value||"all")}),m())}))}function m(){const c=window.Store.getUiSettings().scopeFilter||"all",r=window.Store.computeFinanceContext(!0,c);if(t=r.snapshot,e=r.readModel,d=r.treasury||{},l=r.explanations||{},a=r.diagnostics||{},o=window.Store.getReviewState(),u=Number(e&&e.eventsCount)>0,n=window.FinancialEngine.compute({financeSnapshot:t,financeReadModel:e}),!V.content)return;const f=R(),$=Y();Ce(f);const q=i(f);V.content.classList.toggle("fin-focus-mode",f==="dashboard"&&$),V.content.innerHTML=q.join(""),f==="planning"&&(bt(),cn()),window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.refresh=="function"&&window.CoreDashboardLayout.refresh()}function i(c){return zi({ledger:I,invoices:Dt,scenarioOutcomes:vt,cashCalendar:je,pipelineTabs:_,goals:Ye,projection:le,scenarioLab:T,reviewQueue:pe,obligationReview:Le,paymentReview:et,tensionSignals:ce,weeklyReview:ne,reports:kt,data:Me,settings:Je,reserves:Se,fixedCosts:ke,observatoryHeader:zt,dashboardCockpit:Tt,attentionQueue:tn,next30Days:Mt,strategicPicture:Ze},Gi)(c)}function I(){const c=re(e&&e.transactions).slice().sort((g,Q)=>Date.parse(String(Q&&Q.timestamp||""))-Date.parse(String(g&&g.timestamp||""))),r=L(),f=String(r.search||"").trim().toLowerCase(),$=c.filter(g=>{const Q=window.FinanceDates?.toDateOnly?.(g&&g.timestamp)||String(g&&g.timestamp||"").slice(0,10),Z=r.accountId==="all"||String(g&&g.accountId||"")===String(r.accountId)||String(g&&g.fromAccountId||"")===String(r.accountId)||String(g&&g.toAccountId||"")===String(r.accountId),tt=r.scope==="all"||String(g&&g.scope||"shared")===String(r.scope),ht=r.type==="all"||String(g&&g.ledgerType||"").toLowerCase()===String(r.type).toLowerCase(),yt=r.reviewStatus==="all"||String(g&&g.reviewStatus||"clear")===String(r.reviewStatus),st=!String(r.categoryId||"").trim()||String(g&&g.categoryId||"").toLowerCase().includes(String(r.categoryId).trim().toLowerCase()),la=(!r.dateFrom||Q>=r.dateFrom)&&(!r.dateTo||Q<=r.dateTo),da=!f||[g&&g.description,g&&g.accountName,g&&g.fromAccountName,g&&g.toAccountName,g&&g.categoryId,g&&g.source,g&&g.id,g&&g.transactionEntityId].some(ua=>String(ua||"").toLowerCase().includes(f));return Z&&tt&&ht&&yt&&st&&la&&da}),q=de(),p=c.filter(g=>String(g&&g.categoryId||"").toLowerCase()==="uncategorized"||String(g&&g.reviewStatus||"").toLowerCase()==="needs_review"),O=c.filter(g=>String(g&&g.type)==="expense.recorded"&&!String(g&&g.obligationId||"").trim()&&String(g&&g.categoryId||"").toLowerCase()==="obligation"),x=c.filter(g=>String(g&&g.type)==="expense.recorded"&&!String(g&&g.receiptUrl||"").trim()&&String(g&&g.categoryId||"").toLowerCase()!=="transfer"),ae=$.reduce((g,Q)=>{const Z=Number(Q&&Q.signedAmount);return g+(Number.isFinite(Z)?Z:Number(Q&&Q.amount)||0)},0),Ae=g=>{const Q=ye(g&&(g.id||g.transactionEntityId)||""),Z=String(g&&g.type)==="expense.recorded",tt=!!String(g&&g.obligationId||"").trim();return`
                <div class="fin-ledger-actions">
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${Q}'">Categorize</button>
                    ${Z&&!tt?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${Q}'">Match</button>`:""}
                    <button class="fin-mini-btn" type="button" data-fin-action="reverse-ledger-transaction" data-fin-transaction-id="${Q}">Reverse</button>
                </div>
            `},$e=$.map(g=>{const Q=Number(g&&g.signedAmount),Z=Number.isFinite(Q)?Q:Number(g&&g.amount)||0,tt=[String(g&&g.categoryId||"").toLowerCase()==="uncategorized"?"Needs category":"",String(g&&g.reviewStatus||"").toLowerCase()==="reviewed"?"Reviewed":"",String(g&&g.obligationId||"").trim()?"Matched":"",String(g&&g.type)==="expense.recorded"?"Tax check":""].filter(Boolean);return`
                <div class="fin-transaction-row">
                    <div>
                        <strong>${U(g.description||"Transaction")}</strong>
                        <small>${qe(g.timestamp)} · ${U(g.categoryId||"uncategorized")} · ${U(g.accountName||g.fromAccountName||"Account")} · ${U(g.scope||"shared")}</small>
                        <div class="fin-chip-row">${tt.map(ht=>`<span class="fin-status-pill">${U(ht)}</span>`).join("")}</div>
                    </div>
                    <span class="${Z>=0?"fin-val-pos":"fin-val-neg"}">${Z>=0?"+":"-"}${j(Math.abs(Z),g.currency)}</span>
                </div>
            `}).join(""),P=`
            <div class="fin-ledger-toolbar" aria-label="Ledger filters">
                <div class="fin-ledger-filter-grid">
                    <input id="fin-ledger-search" aria-label="Search ledger" value="${U(r.search)}" placeholder="Search note, account, category, source" />
                    <select id="fin-ledger-account" aria-label="Filter ledger by account">${X(r.accountId)}</select>
                    <select id="fin-ledger-scope" aria-label="Filter ledger by scope">${Qn(r.scope)}</select>
                    <input id="fin-ledger-category" aria-label="Filter ledger by category" value="${U(r.categoryId)}" placeholder="Category" />
                    <select id="fin-ledger-type" aria-label="Filter ledger by type">
                        <option value="all"${r.type==="all"?" selected":""}>All types</option>
                        <option value="income"${r.type==="income"?" selected":""}>Income</option>
                        <option value="expense"${r.type==="expense"?" selected":""}>Expense</option>
                        <option value="transfer"${r.type==="transfer"?" selected":""}>Transfer</option>
                        <option value="adjustment"${r.type==="adjustment"?" selected":""}>Adjustment</option>
                    </select>
                    <select id="fin-ledger-review" aria-label="Filter ledger by review status">
                        <option value="all"${r.reviewStatus==="all"?" selected":""}>All review states</option>
                        <option value="clear"${r.reviewStatus==="clear"?" selected":""}>Clear</option>
                        <option value="needs_review"${r.reviewStatus==="needs_review"?" selected":""}>Needs review</option>
                        <option value="reviewed"${r.reviewStatus==="reviewed"?" selected":""}>Reviewed</option>
                    </select>
                    <input id="fin-ledger-date-from" aria-label="Ledger date from" type="date" value="${U(r.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Ledger date to" type="date" value="${U(r.dateTo)}" />
                </div>
                <div class="fin-action-row fin-action-row--inline">
                    <button class="fin-action-btn" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                    <button class="fin-action-btn" type="button" data-fin-action="clear-ledger-filters">Clear filters</button>
                </div>
            </div>
        `;let H="";return q==="audit"?H=$.length?`
                <table class="fin-table fin-table--compact">
                    <thead><tr><th>Date</th><th>Type</th><th>ID / source</th><th>Account</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                    <tbody>
                        ${$.map(g=>{const Q=Number(g&&g.signedAmount),Z=Number.isFinite(Q)?Q:Number(g&&g.amount)||0;return`
                                <tr>
                                    <td>${qe(g.timestamp)}</td>
                                    <td>${U(g.type||g.ledgerType||"transaction")}</td>
                                    <td>${U(g.id||g.transactionEntityId||"")}<small>${U(g.source||g.reviewStatus||"local ledger")}</small></td>
                                    <td>${U(g.accountName||g.fromAccountName||g.toAccountName||"Account")}</td>
                                    <td style="text-align:right" class="${Z>=0?"fin-val-pos":"fin-val-neg"}">${Z>=0?"+":"-"}${j(Math.abs(Z),g.currency)}</td>
                                    <td style="text-align:right">${Ae(g)}</td>
                                </tr>
                            `}).join("")}
                    </tbody>
                </table>
            `:Ie("Audit log is clean."):q==="work"?H=`
                <div class="fin-status-grid">
                    <div class="fin-status-card"><span>Needs category</span><strong>${p.length}</strong><span>Transactions to classify</span></div>
                    <div class="fin-status-card"><span>Unmatched payments</span><strong>${O.length}</strong><span>Obligation payments to connect</span></div>
                    <div class="fin-status-card"><span>Missing receipt check</span><strong>${x.length}</strong><span>Expense records to review</span></div>
                    <div class="fin-status-card"><span>Filtered records</span><strong>${$.length}</strong><span>${c.length} total movements</span></div>
                </div>
                ${$.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Review</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${$.map(g=>{const Q=Number(g&&g.signedAmount),Z=Number.isFinite(Q)?Q:Number(g&&g.amount)||0;return`
                                <tr>
                                    <td>${qe(g.timestamp)}</td>
                                    <td>${U(g.description||"Transaction")}</td>
                                    <td>${U(g.categoryId||"uncategorized")}</td>
                                    <td>${U(g.reviewStatus||"clear")}</td>
                                    <td style="text-align:right" class="${Z>=0?"fin-val-pos":"fin-val-neg"}">${Z>=0?"+":"-"}${j(Math.abs(Z),g.currency)}</td>
                                    <td style="text-align:right">${Ae(g)}</td>
                                </tr>
                            `}).join("")}
                        </tbody>
                    </table>
                `:Ie("Begin tracking. Add your first payment.")}
            `:H=$.length?$e:Ie("Begin tracking. Add your first payment or sync a CSV."),`
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
                        <div class="fin-status-card"><span>Filtered movement</span><strong class="${ae>=0?"fin-val-pos":"fin-val-neg"}">${ae>=0?"+":"-"}${j(Math.abs(ae))}</strong><span>Current filter result</span></div>
                        <div class="fin-status-card"><span>Needs review</span><strong>${p.length}</strong><span>Category or review work</span></div>
                        <div class="fin-status-card"><span>Matched payments</span><strong>${c.filter(g=>String(g&&g.obligationId||"").trim()).length}</strong><span>Linked to obligations</span></div>
                    </div>
                    ${P}
                    <div class="fin-tabs" role="tablist" aria-label="Transaction view modes">
                        <button class="fin-tab-btn ${q==="clean"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Clean View</button>
                        <button class="fin-tab-btn ${q==="work"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Work View</button>
                        <button class="fin-tab-btn ${q==="audit"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="audit">Audit View</button>
                    </div>
                    <div class="fin-tab-panel">
                        ${H}
                    </div>
                </div>
            </section>
        `}function ne(){const c=We();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-review-prompt">
                    <div>
                        <div class="widget-title ui-title">${c?"Monthly review due":"Monthly review current"}</div>
                        <div class="fin-helper-text">Reconcile cash accounts, inspect pipeline and recurring costs, then leave one operating note.</div>
                        <div class="fin-operating-meta">Last reviewed ${qe(o&&o.lastReviewedAt)}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${c?"Start review":"Open review"}</button>
                </div>
            </section>
        `}function Me(){const c=window.Store&&typeof window.Store.getImportState=="function"?re(window.Store.getImportState().batches).slice(-1)[0]:null,r=window.Store&&typeof window.Store.getLocalDataHealth=="function"?window.Store.getLocalDataHealth():{ok:!0,issues:[],eventCount:0,latestEventAt:null,storageStatus:"healthy",schemaLabel:"unknown",lastBackupAt:null,privateModeWarning:!1,migrationStatus:"current"},f=String(r.storageStatus||"healthy"),$=f==="unavailable"?"Unavailable":f==="limited"?"Limited":"Healthy",q=r.lastBackupAt?qe(r.lastBackupAt):"Never";return`
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Imports and Backups</div>
                        <div class="fin-helper-text">Everything stays local. Use exports before big changes or device moves.</div>
                        ${c?`
                            <div class="modal-list-row">
                                <span><strong>Latest CSV batch</strong><br><small>${U(c.sourceFile)} · ${c.fingerprints.length} rows · ${qe(c.importedAt)}</small></span>
                                <button class="fin-mini-btn" type="button" data-action="undoImportBatch" data-action-args="'${ye(c.id)}'">Undo</button>
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
                        <div class="fin-helper-text">${r.ok?"Local finance data is readable and backup-ready.":"Some local Finance Master data needs attention."}</div>
                        <div class="modal-list-row">
                            <span><strong>${r.ok?"Healthy":"Needs attention"}</strong><br><small>${Number(r.eventCount||0)} finance events${r.latestEventAt?` · latest ${qe(r.latestEventAt)}`:""}</small></span>
                            <span>${r.issues.length} issue${r.issues.length===1?"":"s"}</span>
                        </div>
                        <div class="backup-preview-card">
                            <div><span>Storage</span><strong>${$}</strong></div>
                            <div><span>Last backup</span><strong>${q}</strong></div>
                            <div><span>Schema</span><strong>${U(r.schemaLabel||"unknown")}</strong></div>
                            <div><span>Migration</span><strong>${U(r.migrationStatus||"current")}</strong></div>
                        </div>
                        ${r.privateModeWarning?`
                            <div class="fin-compact-empty">Your browser may not keep local data permanently in this mode. Export a backup before closing this window.</div>
                        `:""}
                        ${r.issues.length?`
                            <div class="fin-compact-empty">${r.issues.map(p=>`${U(p.label)}: ${U(p.message)}`).join("<br>")}</div>
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
        `}function Se(){const c=re(e?.fiatAccounts).filter(x=>!x.bucket||x.bucket==="available"),r=re(e?.reserveBuckets),f=se("actualCash",se("totalCash",Number(t?.realBalance)||0)),$=se("protectedCash",se("reservedCash",Number(t?.reservedCash)||0)),q=se("availableCash",Number.isFinite(Number(t?.availableCash))?Number(t.availableCash):f-$),p=se("trulyAvailableCash",f-$),O=se("committedShortTermObligations",0);return`
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Operating Cash</div>
                        <div class="fin-helper-text">Liquid funds spread across your real-world accounts.</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount'">Add cash account</button>
                </div>
                ${c.length?c.map(x=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${U(x.name)}</strong>
                            <div class="fin-list-item-sub">${U(x.scope||"shared")}</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${j(x.balance)}</div>
                            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'fiatAccount', '${U(x.id)}'">Edit</button>
                        </div>
                    </div>
                `).join(""):Ie("Establish your treasury. Add your primary operating account.")}
                
                <div class="widget ui-card glass fin-card" style="margin-top: 1rem; padding: 1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size: 0.8rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary);">Available Cash</div>
                            <div style="font-size: 2rem; font-family:var(--font-mono); font-weight:600; margin-top:0.25rem;">${j(q)}</div>
                            <div class="fin-helper-text" style="margin-top:0.35rem;">${j(p)} after reserves · ${j(O)} due within 30 days</div>
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
                ${r.length?r.map(x=>{const ae=x.targetAmount>0?Math.min(100,Math.round(x.currentAmount/x.targetAmount*100)):100;return`
                    <div class="widget ui-card glass fin-card fin-list-item" style="flex-direction:column; align-items:stretch; gap:1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="fin-list-item-main">
                                <strong>${U(x.name)}</strong>
                                <div class="fin-list-item-sub">${U(x.purpose||"Reserve").replace("_"," ")}</div>
                            </div>
                            <div class="fin-list-item-actions">
                                <div class="fin-list-item-val">${j(x.currentAmount)} <span style="font-size:0.8rem; color:var(--text-secondary); font-weight:normal;">of ${j(x.targetAmount)}</span></div>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'reserveBucket', '${U(x.id)}'">Edit</button>
                            </div>
                        </div>
                        <div class="fin-stacked-bar" style="height: 8px;">
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${ae}%; background:var(--interactive-primary);"></div>
                        </div>
                    </div>
                `}).join(""):Ie("Protect your runway. Create your first reserve bucket (e.g., Taxes).")}
            </section>
        `}function ke(){const c=re(e?.recurringExpenses),r=re(e?.debtAccounts),f={};try{const P=localStorage.getItem("finance-master.ui.expenseOrder");P&&JSON.parse(P).forEach((g,Q)=>f[g]=Q)}catch{}c.sort((P,H)=>{const g=f.hasOwnProperty(P.id)?f[P.id]:99999,Q=f.hasOwnProperty(H.id)?f[H.id]:99999;return g-Q});const $=c.reduce((P,H)=>P+(Number(H.monthlyAmount)||0),0),q=se("totalMonthlyBurn",Number(t?.monthlyBurn)||$),p=c.filter(P=>P.essential),O=c.filter(P=>!P.essential),x=p.reduce((P,H)=>P+(Number(H.monthlyAmount)||0),0),ae=O.reduce((P,H)=>P+(Number(H.monthlyAmount)||0),0),Ae=Be("debtBurden",r.reduce((P,H)=>P+(Number(H.outstanding)||0),0)),$e=r.reduce((P,H)=>P+(Number(H.minimumPayment)||0),0);return`
            <section class="fin-section">
                <!-- Summary KPIs -->
                <div class="fin-snapshot-grid fin-snapshot-grid--cockpit">
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Monthly burn</div>
                        <div class="fin-tile-value">${j(q)}</div>
                        <div class="fin-tile-subline">${dn(c.length,"recurring cost")}</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Essential</div>
                        <div class="fin-tile-value">${j(x)}</div>
                        <div class="fin-tile-subline">${dn(p.length,"item")} · cannot cut</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Flexible</div>
                        <div class="fin-tile-value">${j(ae)}</div>
                        <div class="fin-tile-subline">${dn(O.length,"item")} · can reduce</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Total debt</div>
                        <div class="fin-tile-value fin-text-med">${j(Ae)}</div>
                        <div class="fin-tile-subline">${dn(r.length,"liability","liabilities")}</div>
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
                ${p.length?p.map((P,H)=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${U(P.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${U(String(P.dueDay))} · ${U(P.scope||"shared")} · Essential</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${j(P.monthlyAmount)} / mo</div>
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${ye(P.id)}', '-1'" ${H===0?'disabled style="opacity:0.3"':""}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${ye(P.id)}', '1'" ${H===p.length-1?'disabled style="opacity:0.3"':""}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${ye(P.id)}'">Edit</button>
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
                ${O.length?O.map((P,H)=>`
                    <div class="widget ui-card glass fin-card fin-list-item">
                        <div class="fin-list-item-main">
                            <strong>${U(P.category)}</strong>
                            <div class="fin-list-item-sub">Due day ${U(String(P.dueDay))} · ${U(P.scope||"shared")} · Flex</div>
                        </div>
                        <div class="fin-list-item-actions">
                            <div class="fin-list-item-val">${j(P.monthlyAmount)} / mo</div>
                            <div style="display:flex; gap:0.25rem;">
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${ye(P.id)}', '-1'" ${H===0?'disabled style="opacity:0.3"':""}>▲</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.moveExpense" data-action-args="'${ye(P.id)}', '1'" ${H===O.length-1?'disabled style="opacity:0.3"':""}>▼</button>
                                <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense', '${ye(P.id)}'">Edit</button>
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
                        <div class="fin-helper-text">Credit lines, loans, and other negative balances.${$e>0?` Combined minimum payments: ${j($e)} / mo.`:""}</div>
                    </div>
                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd'">Add debt item</button>
                </div>
                ${r.length?r.map(P=>{const H=P.planType==="custom"&&P.installments?.length>0||(Number(P.minimumPayment)||0)>0||String(P.paymentPlanNote||"").trim(),g=P.totalAdded>0?Math.min(100,Math.round((P.totalPaid||0)/P.totalAdded*100)):0;return`
                    <div class="widget ui-card glass fin-card fin-debt-card">
                        <div class="fin-debt-header">
                            <div class="fin-list-item-main">
                                <strong>${U(P.name)}</strong>
                                <div class="fin-list-item-sub">${U(P.scope||"shared")}${P.dueDate?` · Due ${qe(P.dueDate)}`:""}</div>
                            </div>
                            <div class="fin-list-item-actions" style="flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                                <div style="display:flex; gap:0.25rem; justify-content: flex-end;">
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPayment', '${ye(P.id)}'" title="Record payment">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtPlan', '${ye(P.id)}'" title="Update plan">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </button>
                                    <button class="fin-mini-btn" style="padding: 0 4px; height: 20px; min-width: 20px;" type="button" data-action="FinancialMode.openAddModal" data-action-args="'debtAdd', '${ye(P.id)}'" title="Edit account">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                    </button>
                                </div>
                                <div class="fin-list-item-val fin-text-med">${j(P.outstanding)}</div>
                            </div>
                        </div>
                        ${P.totalAdded>0?`
                        <div class="fin-debt-progress">
                            <div class="fin-debt-bar-track">
                                <div class="fin-debt-bar-fill" style="width: ${g}%"></div>
                            </div>
                            <div class="fin-debt-bar-label">${j(P.totalPaid||0)} paid of ${j(P.totalAdded)} · ${g}%</div>
                        </div>
                        `:""}
                        <div class="fin-debt-details">
                            ${P.planType==="custom"?`<span>Custom Plan: ${P.installments?.length||0} installments</span>`:(Number(P.minimumPayment)||0)>0?`<span>${(P.frequency||"monthly").charAt(0).toUpperCase()+(P.frequency||"monthly").slice(1)} payment: ${j(P.minimumPayment)}</span>`:""}
                            ${String(P.paymentPlanNote||"").trim()?`<span>Plan note: ${U(P.paymentPlanNote)}</span>`:""}
                            ${H?"":'<span style="color: var(--negative, #ff4b4b); font-weight: 500; display: inline-flex; align-items: center; gap: 0.25rem;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Missing payment plan</span>'}
                        </div>
                    </div>
                `}).join(""):Ie("Debt-free operations.")}
            </section>
        `}function Je(){const c=window.Store.getFinanceSettings(),r=window.Store.getUiSettings();return`
            <section class="fin-section">
                <!-- System Preferences -->
                <div class="widget ui-card glass fin-card fin-settings-card">
                    <div class="widget-title ui-title">System Preferences</div>
                    <div class="fin-settings-form">
                        <div class="form-group">
                            <label for="page-settings-currency">Base currency</label>
                            <input id="page-settings-currency" value="${U(c.baseCurrency||"EUR")}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-forecast">Forecast horizon (days)</label>
                            <input id="page-settings-forecast" type="number" value="${U(c.forecastDays||90)}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-scope">Default scope filter</label>
                            <select id="page-settings-scope">
                                <option value="all"${r.scopeFilter==="all"?" selected":""}>All scopes</option>
                                <option value="business"${r.scopeFilter==="business"?" selected":""}>Business only</option>
                                <option value="personal"${r.scopeFilter==="personal"?" selected":""}>Personal only</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="page-settings-appearance">Appearance</label>
                            <select id="page-settings-appearance">
                                <option value="bright"${r.appearance==="bright"?" selected":""}>Bright (Default)</option>
                                <option value="aurora"${r.appearance==="aurora"?" selected":""}>Aurora (Dark)</option>
                                <option value="midnight"${r.appearance==="midnight"?" selected":""}>Midnight (OLED)</option>
                                <option value="twilight"${r.appearance==="twilight"?" selected":""}>Twilight (Deep Blue)</option>
                                <option value="system"${r.appearance==="system"?" selected":""}>Follow System</option>
                            </select>
                        </div>
                        <label class="settings-check">
                            <input id="page-settings-reduced-motion" type="checkbox"${r.reducedMotion?" checked":""} />
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
        `}function Xe(c){return re(d&&d[c])}function se(c,r=0){const f=Number(d&&d[c]);return Number.isFinite(f)?f:r}function Be(c,r=0){const f=Number(l&&l[c]&&l[c].value);return Number.isFinite(f)?f:r}function Ne(c){return c==="subtract"?"Subtract":c==="divide"?"Divide by":c==="multiply"?"Multiply by":"Add"}function Et(c,r){const f=String(c&&c.key||""),$=Number(r)||0;return f==="runway"?`${$.toFixed(1)} months`:f==="forecastConfidence"?`${Math.round($)}%`:j($)}function ot(c){const r=l&&l[c];return!r||!Array.isArray(r.parts)?"":`
            <details class="fin-metric-explainer" data-fin-explainer="${U(c)}">
                <summary>How calculated</summary>
                <div class="fin-confidence-list">
                    ${r.parts.map(f=>`
                        <div class="fin-confidence-row">
                            <span class="fin-muted">${Ne(f.operation)} ${U(f.label)}</span>
                            <strong>${Et(r,f.value)}</strong>
                        </div>
                    `).join("")}
                    ${re(r.warnings).map(f=>`
                        <div class="fin-confidence-row">
                            <span class="fin-text-med">${U(f)}</span>
                        </div>
                    `).join("")}
                </div>
            </details>
        `}function $t(c){const r=String(c&&(c.status||c.stage)||"").toLowerCase(),f=Number(c&&c.probability),$=window.FinanceDates?.toDateOnly?.(c&&c.expectedDateISO)||String(c&&c.expectedDateISO||"").slice(0,10),q=window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10);return r==="paid"||r==="received"?"paid":$&&$<q?"overdue":r==="confirmed"||f>=.8?"confirmed":r==="risky"||f<.5?"uncertain":"likely"}function Dt(){const c=J(),r=_e().map(p=>({id:String(p&&p.id||""),title:String(p&&p.title||"Expected income"),amount:Number(p&&p.value)||0,probability:Number(p&&p.probability)||0,expectedDateISO:p&&p.expectedDateISO,settlementAccount:String(p&&p.destinationAccountName||p&&p.destinationAccountId||""),status:$t(p)})),f=re(e&&e.invoices).filter(p=>String(p&&p.status||"").toLowerCase()==="paid").slice(0,8).map(p=>({id:String(p&&p.id||""),title:String(p&&(p.client||p.title)||"Paid income"),amount:Number(p&&p.amount)||0,probability:1,expectedDateISO:p&&(p.paidAt||p.sentAt),settlementAccount:String(p&&p.destinationAccountName||""),status:"paid"}));let $=[];c==="open"?$=r.sort((p,O)=>(Date.parse(p.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)-(Date.parse(O.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)):c==="settled"?$=f.sort((p,O)=>(Date.parse(O.expectedDateISO||"")||0)-(Date.parse(p.expectedDateISO||"")||0)):$=r.concat(f).sort((p,O)=>(Date.parse(O.expectedDateISO||"")||0)-(Date.parse(p.expectedDateISO||"")||0));const q=r.reduce((p,O)=>(p[O.status]=(p[O.status]||0)+O.amount,p),{});return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income</div>
                            <div class="fin-helper-text">Expected and settled income records. Settlement turns expected money into real account cash.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Add expected income</button>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${Nt("confirmed")}<strong>${j(q.confirmed||0)}</strong><span>Signed or high-confidence income</span></div>
                        <div class="fin-status-card">${Nt("likely")}<strong>${j(q.likely||0)}</strong><span>Expected but not guaranteed</span></div>
                        <div class="fin-status-card">${Nt("uncertain")}<strong>${j(q.uncertain||0)}</strong><span>Lower-confidence assumptions</span></div>
                        <div class="fin-status-card">${Nt("overdue")}<strong>${j(q.overdue||0)}</strong><span>Follow-up candidates</span></div>
                    </div>
                    
                    <div class="fin-tabs" role="tablist" aria-label="Invoice view modes">
                        <button class="fin-tab-btn ${c==="open"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="open">Open Income</button>
                        <button class="fin-tab-btn ${c==="settled"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="settled">Settled</button>
                        <button class="fin-tab-btn ${c==="all"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="all">All</button>
                    </div>

                    <div class="fin-table-wrap" style="margin-top: 1rem;">
                        ${$.length?`
                            <table class="fin-table fin-table--compact">
                                <thead><tr><th>Source</th><th>Status</th><th>Expected / paid</th><th>Confidence</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                                <tbody>
                                    ${$.map(p=>`
                                        <tr>
                                            <td>${U(p.title)}${p.settlementAccount?`<small>${U(p.settlementAccount)}</small>`:""}</td>
                                            <td>${Nt(p.status)}</td>
                                            <td>${p.expectedDateISO?qe(p.expectedDateISO):"No date"}</td>
                                            <td>${Math.round(p.probability*100)}%</td>
                                            <td style="text-align:right">${j(p.amount)}</td>
                                            <td style="text-align:right">
                                                ${p.status==="paid"?"":`
                                                    <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income', '${ye(p.id)}'">Edit</button>
                                                    <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${ye(p.id)}'">Received</button>
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
        `}function kt(){const c=Ee(),r=se("actualCash",se("totalCash",Number(t&&t.realBalance)||0)),f=se("protectedCash",se("reservedCash",Number(t&&t.reservedCash)||0)),$=Number(t&&t.availableCash),q=se("availableCash",Number.isFinite($)?$:r-f),p=r>0?Math.round(f/r*100):0,O=nt(),x={};let ae=0;re(e?.invoices).concat(re(e?.pipelineDeals)).forEach(g=>{const Q=String(g.client||g.title||"Unknown").trim(),Z=Number(g.amount||g.value)||0;Z>0&&(x[Q]=(x[Q]||0)+Z,ae+=Z)});const Ae=Object.entries(x).sort((g,Q)=>Q[1]-g[1]).slice(0,4).map(([g,Q])=>{const Z=ae>0?Math.round(Q/ae*100):0;return{client:g,amount:Q,pct:Z}}),$e={};let P=0;re(e?.transactions).forEach(g=>{if(String(g.type)==="expense.recorded"||Number(g.signedAmount||g.amount)<0){const Q=String(g.categoryId||"Uncategorized").trim(),Z=Math.abs(Number(g.signedAmount||g.amount)||0);Z>0&&($e[Q]=($e[Q]||0)+Z,P+=Z)}});const H=Object.entries($e).sort((g,Q)=>Q[1]-g[1]).slice(0,4).map(([g,Q])=>{const Z=P>0?Math.round(Q/P*100):0;return{cat:g,amount:Q,pct:Z}});return`
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Financial Health</div>
                        <div class="fin-health-status ${O.tone}">
                            <span>Status</span>
                            <strong>${U(O.text)}</strong>
                            <small>${n&&n.stressLevel?`Stress level ${U(n.stressLevel)}`:"Add core inputs for a clearer reading."}</small>
                        </div>
                        <ul class="fin-advice-list">
                            ${pt().slice(0,4).map(g=>`<li>${U(g)}</li>`).join("")}
                        </ul>
                    </div>
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Reserve Pattern</div>
                        <div class="fin-status-grid">
                            <div class="fin-status-card"><span>Available</span><strong>${j(q)}</strong><span>After protected cash and 30-day obligations</span></div>
                            <div class="fin-status-card"><span>Reserved</span><strong>${j(f)}</strong><span>${p}% of total cash</span></div>
                        </div>
                        ${at(c)}
                    </div>
                </div>
            </section>
            
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card">
                        <div class="widget-title ui-title">Client Concentration</div>
                        <div class="fin-helper-text">Reliance on top income sources. High concentration is a vulnerability.</div>
                        <div class="fin-table-wrap" style="margin-top: 1rem;">
                            ${Ae.length?`
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${Ae.map(g=>`
                                            <tr>
                                                <td style="width: 40%;"><strong>${U(g.client)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${g.pct}%; background: var(--interactive-primary);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${j(g.amount)} <small>(${g.pct}%)</small></td>
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
                            ${H.length?`
                                <table class="fin-table fin-table--compact">
                                    <tbody>
                                        ${H.map(g=>`
                                            <tr>
                                                <td style="width: 40%;"><strong>${U(g.cat)}</strong></td>
                                                <td>
                                                    <div class="fin-stacked-bar" style="height: 6px; background: rgba(255,255,255,0.05);">
                                                        <div class="fin-bar-segment" style="width: ${g.pct}%; background: var(--negative, #ff4b4b);"></div>
                                                    </div>
                                                </td>
                                                <td style="text-align:right; width: 30%;">${j(g.amount)} <small>(${g.pct}%)</small></td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            `:Ie("No expense data available yet.")}
                        </div>
                    </div>
                </div>
            </section>
        `}function zt(){const c=Xe("reviewQueue").length,r=We();return`
            <section class="fin-section fin-section--toolbar">
                <div class="fin-ui-toolbar">
                    <div class="fin-operating-meta">
                        <span>Last updated: ${qe(a.latestEventTimestamp)||"Never"}</span>
                        <span>Unreviewed: ${c}</span>
                        ${r?'<span class="fin-text-high">Review due today</span>':""}
                        <span>Data: Local only</span>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${Qn(window.Store.getUiSettings().scopeFilter||"all")}</select>
                    </div>
                </div>
            </section>
        `}function Tt(){const c=se("actualCash",se("totalCash",Number(t?.realBalance)||0)),r=se("protectedCash",se("reservedCash",Number(t?.reservedCash)||0)),f=Number(t?.availableCash),$=se("availableCash",Number.isFinite(f)?f:se("trulyAvailableCash",c-r)),q=se("totalMonthlyBurn",Number(t?.monthlyBurn)||0),p=d?.incomeScenarios||{},O=Number.isFinite(Number(p.expected))?Number(p.expected):Number(t?.projectedBalance)||$,x=d?.runwayMonths!=null?d.runwayMonths:t?.runwayMonths,ae=x==null?"—":`${Number(x).toFixed(1)}`,Ae=x==null||Number(x)<3?"stress-high":Number(x)<6?"stress-medium":"stress-low",$e=x==null?"No data":Number(x)<3?"Vulnerable":Number(x)<6?"Stable":"Safe to operate",P=Xe("reserveBuckets").filter(st=>["tax_reserve","vat_reserve","health_insurance","debt_repayment","buffer"].includes(String(st.bucket))).filter(st=>Number(st.amount)>0),H=d?.dashboardSummary?.next30Days||{},g=Number(H.confirmedIncoming)||0,Q=Number(H.obligationsDue)||0,Z=c||1,tt=Math.max(0,Math.min(100,Math.round(Math.max(0,$)/Z*100))),ht=Math.max(0,Math.min(100-tt,Math.round(r/Z*100)));let yt="";return O<0?yt=`Projected to close ${j(O)}. Action needed.`:yt=`On track to close with ${j(O)} surplus.`,`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-cockpit-overview">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Current Status</div>
                            <div class="fin-helper-text">Available cash, protected money, runway, and monthly burn from the central calculation engine.</div>
                        </div>
                    </div>

                    <!-- Hero: Runway + Burn -->
                    <div class="fin-cockpit-hero">
                        <div class="fin-runway-gauge">
                            <div class="fin-runway-label">Runway</div>
                            <div class="fin-runway-value ${Ae}">${ae}<span style="font-size: 1.2rem; opacity: 0.6; margin-left: 0.25rem;">${x!=null?"months":""}</span></div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">${$e}</div>
                            ${ot("runway")}
                        </div>
                        <div class="fin-cockpit-burn">
                            <div class="fin-burn-label">Monthly burn</div>
                            <div class="fin-burn-value">${u?j(q):"—"}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.15rem;">Recurring costs</div>
                            ${ot("monthlyBurnRate")}
                        </div>
                    </div>

                    <hr class="fin-divider">

                    <!-- Cash Breakdown -->
                    <div class="fin-cockpit-cash">
                        <div class="fin-cash-header"><span>Total Cash</span><strong>${u?j(c):"—"}</strong></div>
                        <div class="fin-stacked-bar">
                            <div class="fin-bar-segment fin-bar-available" style="width: ${tt}%; transition: width 0.6s ease;"></div>
                            <div class="fin-bar-segment fin-bar-protected" style="width: ${ht}%; transition: width 0.6s ease;"></div>
                        </div>
                        <div class="fin-cash-legend">
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-available"></span>
                                <span class="fin-legend-val">${j($)}</span>
                                <span class="fin-legend-lbl">Available</span>
                                ${ot("availableCash")}
                            </div>
                            <div class="fin-legend-item">
                                <span class="fin-dot fin-dot-protected"></span>
                                <span class="fin-legend-val">${j(r)}</span>
                                <span class="fin-legend-lbl">Protected</span>
                                ${ot("protectedCash")}
                            </div>
                        </div>
                        ${P.length?`
                            <div class="fin-reserve-mini-grid">
                                ${P.map(st=>`
                                    <div style="display:flex; justify-content:space-between; gap: 0.5rem;">
                                        <span>${U(st.label)}</span>
                                        <strong style="font-family: var(--font-mono);">${j(st.amount)}</strong>
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
                                <strong style="color: rgba(168, 230, 207, 0.95);">${j(g)}</strong>
                            </div>
                            <div>
                                <span>Obligations</span>
                                <strong style="color: rgba(241, 185, 167, 0.95);">${j(Q)}</strong>
                            </div>
                            <div>
                                <span>Month-end</span>
                                <strong class="${O<0?"fin-val-neg":""}">${u?j(O):"—"}</strong>
                            </div>
                        </div>
                        <div class="fin-cashflow-copy">${yt}</div>
                    </div>
                </div>
            </section>
        `}function tn(){const c=re(t?.attentionQueue),r=We(),f=d?.incomeScenarios||{},$=Number.isFinite(Number(f.expected))?Number(f.expected):Number(t?.projectedBalance)||0,q=[...r?[{type:"Monthly review",title:"Review not started",action:"Close month",id:"monthly-review"}]:[],...$<0?[{type:"Due soon",title:`Month-end gap: ${j(Math.abs($))}`,action:"Adjust reserves",id:"month-end-gap"}]:[],...c].slice(0,10);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Attention Queue</div>
                            <div class="fin-helper-text">Unresolved items, overdue payments, and missing plans.</div>
                        </div>
                    </div>
                    ${q.length?'<ul class="fin-decision-list" style="gap:0.75rem;">'+q.map(p=>`
                        <li>
                            <div class="fin-decision-header">
                                <div>
                                    <strong>${U(p.title)} ${p.amount!=null?j(p.amount):""}</strong>
                                    <div class="fin-decision-reason" style="text-transform:uppercase; font-size:0.7rem; font-family:var(--font-mono);">${U(p.type)}</div>
                                </div>
                            </div>
                            <div class="fin-decision-actions">
                                <button class="fin-mini-btn" type="button" data-action="${p.id==="monthly-review"?"openEditModal":"FinancialMode.setSection"}" data-action-args="${p.id==="monthly-review"?"'weeklyReview'":"'review'"}">${U(p.action||"Resolve item")}</button>
                            </div>
                        </li>
                    `).join("")+"</ul>":Ie("Attention queue is clear. Smooth sailing.")}
                </div>
            </section>
        `}function Mt(){const c=d?.dashboardSummary?.next30Days||{},r=_e(),f=r.filter(p=>(p.probability||0)>=.8).reduce((p,O)=>p+(Number(O.value)||0),0),$=r.filter(p=>(p.probability||0)>=.5&&(p.probability||0)<.8).reduce((p,O)=>p+(Number(O.value)||0),0),q=r.filter(p=>(p.probability||0)<.5).reduce((p,O)=>p+(Number(O.value)||0),0);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Near Future</div>
                            <div class="fin-helper-text">Expected income and confirmed obligations in the next 30 days.</div>
                        </div>
                    </div>
                    <div class="fin-confidence-list">
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Forecast Confidence</span>
                            <strong>${Et(l&&l.forecastConfidence||{key:"forecastConfidence"},Be("forecastConfidence",Math.round((Number(t?.confidenceScore)||0)*100)))}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Expected weighted</span>
                            <strong class="fin-text-primary">${j(c.expectedWeightedIncoming)}</strong>
                        </div>
                        <div class="fin-divider-line"></div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Confirmed</span>
                            <strong class="fin-text-safe">${j(f)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Likely</span>
                            <strong class="fin-text-med">${j($)}</strong>
                        </div>
                        <div class="fin-confidence-row">
                            <span class="fin-muted">Unconfirmed</span>
                            <strong class="fin-text-high">${j(q)}</strong>
                        </div>
                    </div>
                    ${ot("forecastConfidence")}
                    <div class="fin-action-row">
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'income'">Confirm income</button>
                    </div>
                </div>
            </section>
        `}function Ze(){const c=se("actualCash",se("totalCash",Number(t?.realBalance)||0)),r=se("protectedCash",se("reservedCash",Number(t?.reservedCash)||0)),f=se("totalMonthlyBurn",Number(t?.monthlyBurn)||0),$=Be("debtBurden",Number(t?.totalDebt)||0),q=Be("forecastConfidence",Math.round((Number(t?.confidenceScore)||0)*100)),p=c>0?Math.round(r/c*100):0;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Strategic Picture</div>
                            <div class="fin-helper-text">Burn, protected cash, debt pressure, and forecast confidence for slower decisions.</div>
                        </div>
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">
                            <span>Monthly burn</span>
                            <strong>${j(f)}</strong>
                            <span>Recurring obligations and payment plans</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Debt burden</span>
                            <strong>${j($)}</strong>
                            <span>This payment plan affects runway when active</span>
                            ${ot("debtBurden")}
                        </div>
                        <div class="fin-status-card">
                            <span>Protected cash</span>
                            <strong>${j(r)}</strong>
                            <span>${p}% of actual cash</span>
                        </div>
                        <div class="fin-status-card">
                            <span>Forecast confidence</span>
                            <strong>${Et(l&&l.forecastConfidence||{key:"forecastConfidence"},q)}</strong>
                            <span>Based on missing inputs and warnings</span>
                        </div>
                    </div>
                </div>
            </section>
        `}function pe(){const c=Xe("reviewQueue"),r=We();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Review Queue</div>
                            <div class="fin-helper-text">${c.length} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${r?"Start review":"Open review"}</button>
                    </div>
                    ${c.length?c.map($=>`
                        <div class="modal-list-row">
                            <span><strong>${U($.title)}</strong><br><small>${U($.reason)} · ${U($.kind||"review")}</small></span>
                            <span>${Nt($.tone==="urgent"?"overdue":"needs_review")}</span>
                            <span class="goal-modal-actions">${He($)}</span>
                        </div>
                    `).join(""):Ie("All items reviewed and reconciled.")}
                </div>
            </section>
        `}function He(c){const r=String(c&&c.kind||"setup"),f=ye(c&&(c.targetId||c.id)||"");return r==="transaction"?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${f}'">Categorize</button>`:r==="payment"?`
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${f}'">Match</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${f}'">Categorize</button>
            `:r==="pipeline"?`
                <button class="fin-mini-btn" type="button" data-action="markAsPaid" data-action-args="'${f}'">Received</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'pipelineReview', '${f}'">Update</button>
                <button class="fin-mini-btn" type="button" data-action="cancelPipelineFromReview" data-action-args="'${f}'">Cancel</button>
            `:r==="debt"?`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'debtPlan', '${f}'">Add plan</button>`:r==="obligation"?`
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${f}'">Mark paid</button>
                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${f}'">Defer</button>
                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${f}'">Review</button>
            `:String(c&&c.id)==="missing-cash"?`<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'fiatAccount'">Add account</button>`:String(c&&c.id)==="missing-burn"?`<button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add cost</button>`:`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'weeklyReview'">${U(c&&c.actionLabel||"Review")}</button>`}function Le(){const c=Xe("obligations").filter(r=>["overdue","due_soon","needs_review"].includes(String(r&&r.status||""))).slice(0,12);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Expected Obligations</div>
                            <div class="fin-helper-text">Resolve due costs here: pay, defer, or keep them flagged for review.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="FinancialMode.openAddModal" data-action-args="'expense'">Add recurring cost</button>
                    </div>
                    ${c.length?c.map(r=>`
                        <div class="modal-list-row">
                            <span><strong>${U(r.title)}</strong><br><small>${r.dueDate?qe(r.dueDate):"No due date"} · ${U(r.scope||"shared")}</small></span>
                            <span>${Nt(r.status)} ${j(r.amount)}</span>
                            <span class="goal-modal-actions">
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationPayment', '${ye(r.id)}'">Mark paid</button>
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'obligationDefer', '${ye(r.id)}'">Defer</button>
                                <button class="fin-mini-btn" type="button" data-action="markObligationNeedsReview" data-action-args="'${ye(r.id)}'">Review</button>
                            </span>
                        </div>
                    `).join(""):Ie("No pressing obligations. You are in the clear.")}
                </div>
            </section>
        `}function et(){const c=re(e&&e.transactions).filter(r=>String(r&&r.type)==="expense.recorded").slice(0,8);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Actual Payments</div>
                            <div class="fin-helper-text">Payments booked into the ledger. Matched payments are tied to an obligation; the rest are review material.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transaction'">Add payment</button>
                    </div>
                    ${c.length?c.map(r=>{const f=!!r.obligationId;return`
                        <div class="modal-list-row">
                            <span><strong>${U(r.description||"Payment")}</strong><br><small>${qe(r.timestamp)} · ${U(r.accountName||"Account")} · ${U(r.categoryId||"uncategorized")}</small></span>
                            <span>${Nt(f?"paid":"needs_review")} ${j(r.amount,r.currency)}</span>
                            <span class="goal-modal-actions">
                                ${f?"":`<button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${ye(r.id)}'">Match</button>`}
                                <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${ye(r.id)}'">Categorize</button>
                            </span>
                        </div>
                    `}).join(""):Ie("Awaiting payments. Book transactions to match them against expectations.")}
                </div>
            </section>
        `}function vt(){const c=d&&d.incomeScenarios||{};return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="widget-title ui-title">Scenarios</div>
                    <div class="fin-helper-text">Three readable forecasts for the current horizon: conservative, realistic, and optimistic.</div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">
                            <span class="fin-muted">Conservative</span>
                            <strong>${j(c.conservative)}</strong>
                            <span>Confirmed income only</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Realistic</span>
                            <strong>${j(c.expected)}</strong>
                            <span>Confirmed + expected</span>
                        </div>
                        <div class="fin-status-card">
                            <span class="fin-muted">Optimistic</span>
                            <strong>${j(c.optimistic)}</strong>
                            <span>Confirmed + expected + risky</span>
                        </div>
                    </div>
                </div>
            </section>
        `}function We(){const c=Date.parse(String(o&&o.lastReviewedAt||""));return!Number.isFinite(c)||Date.now()-c>=10080*60*1e3}function mt(c=90){const r=new Date;r.setHours(12,0,0,0);const f=new Date(r);f.setDate(f.getDate()+c);const $=[];re(e&&e.recurringExpenses).forEach(p=>{for(let O=0;O<4;O+=1){const x=new Date(r.getFullYear(),r.getMonth()+O,Math.max(1,Math.min(28,Number(p.dueDay)||1)),12);x<r||x>f||$.push({date:x,label:p.category,amount:-(Number(p.monthlyAmount)||0),kind:"Cost"})}}),_e().forEach(p=>{const O=new Date(p.expectedDateISO||"");!Number.isFinite(O.getTime())||O<r||O>f||$.push({date:O,label:p.title,amount:(Number(p.value)||0)*(Number(p.probability)||0),kind:"Expected income"})}),$.sort((p,O)=>p.date-O.date);const q=[30,60,90].map(p=>{const O=new Date(r);O.setDate(O.getDate()+p);let x=Number(t&&t.realBalance)||0,ae=x;return $.filter(Ae=>Ae.date<=O).forEach(Ae=>{x+=Ae.amount,ae=Math.min(ae,x)}),{horizon:p,low:ae}});return{events:$,lows:q}}function je(){const c=mt();return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-calendar-card">
                    <div class="widget-title ui-title">Cash Calendar</div>
                    <div class="fin-helper-text">Upcoming obligations and probability-weighted income. Start with the next material moments.</div>
                    <div class="fin-calendar-lows">
                        ${c.lows.map(r=>`<div><span>${r.horizon}d low</span><strong>${j(r.low)}</strong></div>`).join("")}
                    </div>
                    <div class="fin-calendar-events">
                        ${c.events.length?c.events.slice(0,3).map(r=>`
                            <div class="fin-calendar-event">
                                <span><strong>${r.label}</strong><small>${r.kind} · ${qe(r.date)}</small></span>
                                <span class="${r.amount>=0?"fin-val-pos":"fin-val-neg"}">${r.amount>=0?"+":"-"}${j(Math.abs(r.amount))}</span>
                            </div>
                        `).join(""):Ie("Map out upcoming events to shape your cash calendar.")}
                    </div>
                </div>
            </section>
        `}function Ye(){const c=window.Store.getUiSettings().scopeFilter||"all",r=typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(c):[];return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-goals-card">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings and Buffer Goals</div>
                            <div class="fin-helper-text">Live progress from linked cash accounts. Keep the targets few and useful.</div>
                        </div>
                        <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'${r.length?"goals":"goal"}'">${r.length?"Manage goals":"Add goal"}</button>
                    </div>
                    ${r.length?`
                        <div class="fin-goals-grid">
                            ${r.map(f=>`
                                <div class="fin-goal-item">
                                    <div class="fin-goal-meta">
                                        <span><strong>${U(f.name)}</strong><small>${U(f.type)} · ${U(f.scope)}${f.targetDate?" · by "+qe(f.targetDate):""}</small></span>
                                        <span>${Math.round(f.progressPercent)}%</span>
                                    </div>
                                    <div class="fin-goal-track"><span style="width:${f.progressPercent}%"></span></div>
                                    <div class="fin-goal-values"><span>${j(f.currentAmount)}</span><span>of ${j(f.targetAmount)}</span></div>
                                </div>
                            `).join("")}
                        </div>
                    `:Ie("Set a safety buffer to build peace of mind.")}
                </div>
            </section>
        `}function _(){const c=_e(),r=re(e&&e.invoices).filter(x=>String(x&&x.status||"").toLowerCase()==="paid").sort((x,ae)=>new Date(ae.paidAt||ae.sentAt||0)-new Date(x.paidAt||x.sentAt||0)),f=c.reduce((x,ae)=>x+(Number(ae.value)||0)*(Number(ae.probability)||0),0),$=c.map(x=>({title:x.title||"Pipeline item",weighted:(Number(x.value)||0)*(Number(x.probability)||0)})).sort((x,ae)=>ae.weighted-x.weighted).slice(0,4),q=Ee(),p=F();let O="";return p==="history"?O=r.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Paid date</th><th>Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${r.map(x=>`
                                <tr>
                                    <td>${x.client||"Invoice"}</td>
                                    <td>${new Date(x.paidAt||x.sentAt||Date.now()).toLocaleDateString()}</td>
                                    <td>${j(x.amount)}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${ye(x.id)}'" title="Remove from history">×</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `:Ie("No settled income yet."):p==="cashflow"?O=at(q):O=`
                ${c.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Expected date</th><th>Amount</th><th>Prob.</th><th>Weighted</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${c.map(x=>`
                                <tr>
                                    <td>${x.title||"Pipeline item"}</td>
                                    <td>${x.expectedDateISO}</td>
                                    <td>${j(x.value)}</td>
                                    <td>${(Number(x.probability||0)*100).toFixed(0)}%</td>
                                    <td class="fin-val-pos">${j((Number(x.value)||0)*(Number(x.probability)||0))}</td>
                                    <td style="text-align:right">
                                        <button class="fin-mini-btn" data-action="FinancialMode.openAddModal" data-action-args="'income', '${ye(x.id)}'" title="Edit">${Ke("edit",{size:"xs",tone:"muted"})}</button>
                                        <button class="fin-mini-btn" data-action="markAsPaid" data-action-args="'${ye(x.id)}'" title="Mark as paid">${Ke("success",{size:"xs",tone:"success"})}</button>
                                        <button class="fin-mini-btn" data-action="deleteInvoice" data-action-args="'${ye(x.id)}'" title="Archive">×</button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `:Ie(u?"Forecast future income. What is the next likely incoming payment?":"Begin tracking. Add your first entry.")}
                ${c.length&&$.length?`
                    <div class="fin-tab-subsection">
                        <div class="fin-muted fin-subtitle">Dependencies</div>
                        ${$.map(x=>{const ae=f>0?Math.round(x.weighted/f*100):0;return`<div class="fin-row-inline"><span>${x.title}</span><span class="fin-muted">${ae}%</span></div>`}).join("")}
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
        `}function le(){return`
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
        `}function pt(){const c=[],r=Number(t&&t.runwayMonths),f=Number.isFinite(r),$=re(t&&t.missingInputs),q=Number(t&&t.totalDebt)||0,p=Number(t&&t.realBalance)||0,O=Number(t&&t.confidenceScore);return f?r<2?c.push("Runway is very thin. Consider protecting liquidity and easing optional spend."):r<4?c.push("Runway is thin. It may help to secure one near‑term paid commitment."):c.push("Runway looks steady. Keep it simple."):c.push("Runway becomes clearer once recurring expenses are noted."),q>Math.max(1,p)&&c.push("Debt is high compared to cash on hand. A weekly check-in may help."),$.length>0&&c.push(`Missing: ${$.slice(0,2).join(", ")}.`),Number.isFinite(O)&&O<.5&&c.push("Confidence is thin. Add one recent income or expense to sharpen the picture."),c.length===0&&c.push("Nothing pressing right now. Keep reconciling as you go."),c}function s(){const c=Number(y.burnDelta||0),r=Number(y.marketMajors||0),f=Number(y.probFloor||50);return`Scenario: burn ${c>=0?"+":""}${c}%, market ${r>=0?"+":""}${r}%, probability floor ${f}%.`}function T(){const c=pt(),r=b?c:c.slice(0,2),f=c.length>2;return`
            <section class="fin-section">
                <div class="fin-lab-grid">
                    <div class="widget ui-card glass fin-card">
                        <div class="drag-handle">⋮⋮</div>
                        <div class="widget-title ui-title">Simulator Lab</div>
                        <div class="fin-helper-text">Stress-test your runway with freelancer-specific scenarios.</div>
                        
                        <div class="fin-slider-group" style="margin-top: 1rem;">
                            <label class="settings-check">
                                <input type="checkbox" id="fin-lab-client" ${y.loseClient?"checked":""} />
                                <span>Lose biggest client</span>
                            </label>
                            ${xe("Delay payments by","delay",y.delayPayments||0,0,90," days")}
                            ${xe("Tax rate hike","tax",y.taxHike||0,0,20,"%")}
                            <hr style="border-top: 1px solid var(--border-color); margin: 1rem 0; opacity: 0.5;">
                            ${xe("Income Probability Floor","probFloor",y.probFloor,0,100,"%")}
                            ${xe("Monthly Burn Delta","burnDelta",y.burnDelta,-30,30,"%")}
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
                            ${r.map($=>`<li>${$}</li>`).join("")}
                        </ul>
                        ${f?`
                            <button class="fin-inline-link" type="button" data-fin-action="toggle-advice">
                                ${b?"Show less":"Show more"}
                            </button>
                        `:""}
                        <div id="fin-lab-scenario" class="fin-scenario-line">${s()}</div>
                    </div>
                </div>
            </section>
        `}function ce(){const c=[],f=(typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter||"all"):[]).find(x=>x.type==="buffer");t.runwayMonths==null?c.push("Runway is unknown until monthly burn is noted."):Number(t.runwayMonths)<2?c.push("Runway is under 2 months. Consider easing cash outflow."):Number(t.runwayMonths)<4&&c.push("Runway is under 4 months. It may help to favor steadier income."),Number(t.totalDebt)>Math.max(1,Number(t.realBalance))&&c.push("Debt is higher than cash on hand.");const $=re(t.missingInputs);$.length&&c.push("Missing: "+$.slice(0,3).join(", ")),We()&&c.push("Weekly review is due. Reconcile cash accounts and leave a short note."),f&&Number(f.progressPercent)<100&&c.push(`Buffer goal is ${Math.round(Number(f.progressPercent)||0)}% funded.`);const q=c.slice(0,3),p=[];t.runwayMonths!=null&&Number(t.runwayMonths)>=4&&p.push("Runway has some breathing room."),t.monthlyBurn!=null&&p.push("Monthly burn is noted."),$.length||p.push("Core inputs are complete."),Number(t.totalDebt)<=Math.max(1,Number(t.realBalance))&&p.push("Debt is not outweighing cash on hand."),We()||p.push("Weekly review is current."),f&&Number(f.progressPercent)>=100&&p.push("Safety buffer is funded.");const O=p.slice(0,3);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Signals</div>
                    <div class="fin-signals-grid">
                        <div class="fin-signal-column fin-signal-column--stable">
                            <div class="fin-signal-title">Stability</div>
                            <div class="fin-signal-list">
                                ${O.length?O.map(x=>`<div class="fin-signal-row">${x}</div>`).join(""):'<div class="fin-compact-empty">No stabilizers yet.</div>'}
                            </div>
                        </div>
                        <div class="fin-signal-column fin-signal-column--tension">
                            <div class="fin-signal-title">Tension</div>
                            <div class="fin-signal-list">
                                ${q.length?q.map(x=>`<div class="fin-signal-row">${x}</div>`).join(""):'<div class="fin-compact-empty">No major tension right now.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `}function xe(c,r,f,$,q,p){return`
            <div class="fin-slider-item">
                <div class="fin-slider-header">
                    <label>${c}</label>
                    <span id="val-${r}">${f}${p}</span>
                </div>
                <input type="range" class="fin-range" id="slip-${r}" min="${$}" max="${q}" value="${f}">
            </div>
        `}function bt(){const c=document.getElementById("fin-projection-svg");if(!c||!window.FinancialEngine||typeof window.FinancialEngine.generateProjections!="function")return;const r=window.FinancialEngine.generateProjections({financeSnapshot:t,financeReadModel:e},{burnChange:Number(y.burnDelta||0)/100,probFloor:Number(y.probFloor||50),marketShift:Number(y.marketMajors||0)/100}),f=r.safe||[],$=r.realistic||[],q=r.optimistic||[],p=f.concat($).concat(q),O=Math.max(1,...p),x=Math.min(0,...p),ae=960,Ae=280,$e=24,P=12,H=16,g=28,Q=(ae-$e-P)/Math.max(1,f.length-1),Z=function(ht){const yt=O-x||1;return H+(O-ht)/yt*(Ae-H-g)},tt=function(ht){return ht.map((yt,st)=>`${st===0?"M":"L"} ${$e+st*Q} ${Z(yt)}`).join(" ")};c.innerHTML=`
            <rect x="0" y="0" width="${ae}" height="${Ae}" fill="var(--fin-chart-bg)"></rect>
            <line x1="${$e}" y1="${Z(0)}" x2="${ae-P}" y2="${Z(0)}" stroke="var(--fin-chart-grid)" stroke-width="1"></line>
            <path d="${tt(f)}" fill="none" stroke="var(--fin-chart-safe)" stroke-width="2.35"></path>
            <path d="${tt($)}" fill="none" stroke="var(--fin-chart-realistic)" stroke-width="2.35"></path>
            <path d="${tt(q)}" fill="none" stroke="var(--fin-chart-optimistic)" stroke-width="1.9"></path>
        `}function cn(){["marketMajors","burnDelta","probFloor"].forEach(r=>{const f=document.getElementById("slip-"+r);!f||f.dataset.bound==="1"||(f.dataset.bound="1",f.addEventListener("input",function(){y[r]=Number(f.value)||0,window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scenario:y});const $=document.getElementById("val-"+r);$&&($.textContent=f.value+"%");const q=document.getElementById("fin-lab-scenario");q&&(q.textContent=s()),bt()}))})}function rt(c,r){console.log("[FinancialMode] Opening modal for:",c),window.openEditModal&&(r?window.openEditModal(c,{id:String(r)}):window.openEditModal(c))}function Vt(){if(!window.Store)return;const c=document.getElementById("page-settings-currency"),r=document.getElementById("page-settings-forecast"),f=document.getElementById("page-settings-scope"),$=document.getElementById("page-settings-appearance"),q=document.getElementById("page-settings-reduced-motion");if(c&&r&&f&&$&&q)try{window.Store.saveFinanceSettings({baseCurrency:c.value||"EUR",forecastDays:Number(r.value)||90}),window.Store.saveUiSettings({appearance:$.value||"bright",reducedMotion:q.checked,scopeFilter:f.value||"all"}),window.applyAppearance&&window.applyAppearance(window.Store),window.FinancialMode.render()}catch(p){console.error("Failed to save settings:",p),window.showModalError&&window.showModalError(p.message||"Could not save settings.")}}function Gt(c,r){const f=re(e?.recurringExpenses),$=f.find(H=>String(H.id)===String(c));if(!$)return;const q=$.essential,p=f.filter(H=>H.essential===q),O={};try{const H=localStorage.getItem("finance-master.ui.expenseOrder");H&&JSON.parse(H).forEach((Q,Z)=>O[Q]=Z)}catch{}p.sort((H,g)=>{const Q=O.hasOwnProperty(H.id)?O[H.id]:99999,Z=O.hasOwnProperty(g.id)?O[g.id]:99999;return Q-Z});const x=p.findIndex(H=>String(H.id)===String(c));if(x===-1)return;const ae=x+Number(r);if(ae<0||ae>=p.length)return;const Ae=p[x];p[x]=p[ae],p[ae]=Ae;const $e=f.filter(H=>H.essential!==q);$e.sort((H,g)=>{const Q=O.hasOwnProperty(H.id)?O[H.id]:99999,Z=O.hasOwnProperty(g.id)?O[g.id]:99999;return Q-Z});const P=[...q?p:$e,...q?$e:p].map(H=>String(H.id));try{localStorage.setItem("finance-master.ui.expenseOrder",JSON.stringify(P))}catch{}m()}return{init:it,render:m,setSection:te,toggleMobileNav:fe,closeMobileNav:he,setFocusMode:k,setPipelineTab:C,openAddModal:rt,saveSettingsPage:Vt,moveExpense:Gt}})();window.Store=z;window.FinanceFormatting={formatCurrencyAmount:ma,resolveCurrencyCode:Kn};await z.initialize();z.seedDemoIfNeeded();kn(z);window.FinancialMode?.init();window.addEventListener("finance:ui-updated",()=>{kn(z),window.FinancialMode?.render()});
