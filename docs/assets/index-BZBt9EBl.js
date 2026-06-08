(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const u of c.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&r(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(o){if(o.ep)return;o.ep=!0;const c=n(o);fetch(o.href,c)}})();const Wa={attention:'<circle cx="12" cy="12" r="8"></circle><circle cx="12" cy="12" r="2"></circle><path d="M12 4v2"></path><path d="M20 12h-2"></path><path d="M12 20v-2"></path><path d="M4 12h2"></path>',edit:'<path d="M4 16.5V20h3.5L18.2 9.3l-3.5-3.5L4 16.5Z"></path><path d="M12.9 7.1l3.5 3.5"></path>',link:'<path d="M9.5 14.5 14.5 9.5"></path><path d="M8.8 10.8 7.4 12.2a3 3 0 0 0 4.2 4.2l1.4-1.4"></path><path d="m11 9 1.4-1.4a3 3 0 0 1 4.2 4.2l-1.4 1.4"></path>',"money-in":'<path d="M12 3v11"></path><path d="m8 10 4 4 4-4"></path><path d="M5 17.5h14"></path><path d="M7 20h10"></path>',cash:'<rect x="3" y="7" width="18" height="10" rx="2"></rect><circle cx="12" cy="12" r="2.5"></circle><path d="M6 10v4"></path><path d="M18 10v4"></path>',calendar:'<rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M4 10h16"></path>',debt:'<path d="M7 7h10a3 3 0 0 1 0 6H7a3 3 0 0 0 0 6h10"></path><path d="M8 11h8"></path><path d="M8 15h8"></path>',shield:'<path d="M12 3 5 6v5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3Z"></path><path d="m9 12 2 2 4-4"></path>',"trend-down":'<path d="M4 7h5l4 5 3-3 4 5"></path><path d="M17 14h3v-3"></path>',review:'<path d="M7 4h10l3 3v13H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"></path><path d="M16 4v4h4"></path><path d="M8 12h6"></path><path d="M8 16h4"></path>',"arrow-up":'<path d="M12 19V5"></path><path d="m6 11 6-6 6 6"></path>',"arrow-down":'<path d="M12 5v14"></path><path d="m18 13-6 6-6-6"></path>',"weather-clear":'<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.9 4.9 1.4 1.4"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.9 19.1 1.4-1.4"></path><path d="m17.7 6.3 1.4-1.4"></path>',"weather-cloud":'<path d="M7 17h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 17Z"></path>',"weather-rain":'<path d="M7 15h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 15Z"></path><path d="M8 19v2"></path><path d="M12 18v2"></path><path d="M16 19v2"></path>',"weather-storm":'<path d="M7 14h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.1 2A3 3 0 0 0 7 14Z"></path><path d="m13 14-3 5h4l-2 3"></path>',close:'<path d="m6 6 12 12"></path><path d="M18 6 6 18"></path>',sprout:'<path d="M12 20v-7"></path><path d="M12 13c-2.8 0-5-2.2-5-5.1 2.8 0 5 2.2 5 5.1Z"></path><path d="M12 13c2.8 0 5-2.2 5-5.1-2.8 0-5 2.2-5 5.1Z"></path>',success:'<path d="m5 12 4 4 10-10"></path>',warning:'<path d="M12 3 2.8 19h18.4L12 3Z"></path><path d="M12 9v4.5"></path><path d="M12 16.5h.01"></path>'};window.renderSAGIcon=(e,t={})=>{const n=Wa[e]||Wa.attention,r=t.size?` sag-icon--${t.size}`:"",o=t.tone?` sag-tone-${t.tone}`:"";return`<svg class="sag-icon${r}${o}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g>${n}</g></svg>`};(function(e){function t(h){return String(h).padStart(2,"0")}function n(h,b,_){var B=Number(h),N=Number(b),x=Number(_);if(!Number.isInteger(B)||!Number.isInteger(N)||!Number.isInteger(x))return"";var q=new Date(Date.UTC(B,N-1,x,12,0,0,0));return q.getUTCFullYear()!==B||q.getUTCMonth()!==N-1||q.getUTCDate()!==x?"":B+"-"+t(N)+"-"+t(x)}function r(h){var b=String(h||"").trim();if(!/^\d{4}-\d{2}-\d{2}$/.test(b))return!1;var _=b.split("-").map(Number);return n(_[0],_[1],_[2])===b}function o(h){if(h==null||h==="")return"";if(typeof h=="number"||Object.prototype.toString.call(h)==="[object Date]"){var b=new Date(h);return Number.isFinite(b.getTime())?n(b.getUTCFullYear(),b.getUTCMonth()+1,b.getUTCDate()):""}var _=String(h).trim();if(r(_))return _;var B=Date.parse(_);if(!Number.isFinite(B))return"";var N=new Date(B);return n(N.getUTCFullYear(),N.getUTCMonth()+1,N.getUTCDate())}function c(){var h=new Date;return n(h.getFullYear(),h.getMonth()+1,h.getDate())}function u(h){var b=o(h);return b?b+"T12:00:00.000Z":new Date().toISOString()}function m(h,b){var _=o(h);if(!_)return"";var B=_.split("-").map(Number),N=new Date(Date.UTC(B[0],B[1]-1,B[2]+(Number(b)||0),12,0,0,0));return n(N.getUTCFullYear(),N.getUTCMonth()+1,N.getUTCDate())}function f(h){var b=o(h);return b?b.slice(0,7):""}function y(h,b){var _=o(h),B=o(b);return!_||!B?0:_<B?-1:_>B?1:0}e.FinanceDates={addDaysDateOnly:m,compareDateOnly:y,dateOnlyFromParts:n,dateOnlyToNoonIso:u,isDateOnly:r,monthKey:f,todayDateOnly:c,toDateOnly:o}})(typeof window<"u"?window:globalThis);(function(e){var t=["income.received","expense.recorded","expense.recurring_set","obligation.reviewed","debt.added","debt.payment_made","invoice.sent","invoice.paid","pipeline.created","pipeline.stage_changed","pipeline.value_changed","pipeline.probability_changed","transaction.reviewed","debt.plan_updated","transfer.recorded","cash.adjusted"],n=["balance.opening_set","asset.account_set","asset.position_set","asset.defi_set","asset.reserve_set","asset.reserve_allocated","project.profile_set","finance.event_reversed"],r=t.concat(n);function o(J){if(J!==void 0)try{return JSON.parse(JSON.stringify(J))}catch{return J}}function c(J){var K=Number(J);return Number.isFinite(K)?Math.round(K*100)/100:0}function u(){try{if(e.crypto&&typeof e.crypto.randomUUID=="function")return e.crypto.randomUUID()}catch{}return"fin-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,10)}function m(J,K){var W=String(J||K||"EUR").trim().toUpperCase();return W||"EUR"}function f(J){var K=Number(J);return!Number.isFinite(K)||K<0?0:K>1?1:K}function y(J){return r.indexOf(String(J||"").trim())!==-1}function h(J){if(typeof J!="string"||!J.trim())return!1;var K=Date.parse(J);return Number.isFinite(K)?J.indexOf("T")!==-1:!1}function b(J){return h(J)?new Date(J).toISOString():null}function _(J,K){var W=Date.parse(J);if(!Number.isFinite(W))return null;var re=new Date(W);try{var le=new Intl.DateTimeFormat("en-CA",{timeZone:K||void 0,year:"numeric",month:"2-digit",day:"2-digit"}),Ne=le.formatToParts(re),Ae=Ne.find(function(U){return U.type==="year"}),C=Ne.find(function(U){return U.type==="month"}),F=Ne.find(function(U){return U.type==="day"});if(Ae&&C&&F)return Ae.value+"-"+C.value+"-"+F.value}catch{}var Q=re.getFullYear(),X=String(re.getMonth()+1).padStart(2,"0"),O=String(re.getDate()).padStart(2,"0");return Q+"-"+X+"-"+O}function B(J){var K=Number(J);return Number.isFinite(K)?Math.round(K*100):0}function N(J){var K=Number(J);return Number.isFinite(K)?Math.round(K)/100:0}function x(J){var K=Array.isArray(J)?J.slice():[];return K.sort(function(W,re){var le=Date.parse(W&&W.timestamp?W.timestamp:"")||0,Ne=Date.parse(re&&re.timestamp?re.timestamp:"")||0;if(le!==Ne)return le-Ne;var Ae=Date.parse(W&&W.created_at?W.created_at:"")||0,C=Date.parse(re&&re.created_at?re.created_at:"")||0;if(Ae!==C)return Ae-C;var F=String(W&&W.id||""),Q=String(re&&re.id||"");return F.localeCompare(Q)})}function q(J,K){var W=K||{},re=J&&typeof J=="object"?J:{},le=String(re.type||"").trim();if(!y(le))throw new Error("Invalid financial event type: "+le);var Ne=Number(re.amount);if(!Number.isFinite(Ne))throw new Error("Financial event amount must be a finite number.");var Ae=b(W.nowIso)||new Date().toISOString(),C=b(re.timestamp);if(!C&&W.allowApproximateTimestamp){var F=re.timestamp||re.created_at||Ae,Q=Date.parse(F);Number.isFinite(Q)&&(C=new Date(Q).toISOString())}if(!C)throw new Error("Financial event timestamp is required and must be ISO-8601.");var X={id:String(re.id||u()),timestamp:C,type:le,amount:c(Ne),currency:m(re.currency,W.baseCurrency),metadata:o(re.metadata&&typeof re.metadata=="object"?re.metadata:{}),created_at:b(re.created_at)||Ae};return re.related_entity_id!=null&&String(re.related_entity_id).trim()&&(X.related_entity_id=String(re.related_entity_id).trim()),re.updated_at&&h(re.updated_at)&&(X.updated_at=new Date(re.updated_at).toISOString()),!re.timestamp&&W.allowApproximateTimestamp&&(X.metadata.approximateTimestamp=!0),X}function H(J){var K=new Set,W=x(J);return W.forEach(function(re){if(!(!re||re.type!=="finance.event_reversed")){var le=re.related_entity_id||re.metadata&&re.metadata.reversed_event_id||re.metadata&&re.metadata.event_id||null;le&&K.add(String(le))}}),K}var fe={REQUIRED_EVENT_TYPES:t,SUPPLEMENTAL_EVENT_TYPES:n,ALL_EVENT_TYPES:r,deepClone:o,roundMoney:c,createId:u,normalizeCurrency:m,clampProbability:f,isValidEventType:y,isIsoTimestamp:h,localDateKey:_,toMinor:B,fromMinor:N,sortFinancialEvents:x,createFinancialEvent:q,resolveReversedEventIds:H};typeof module<"u"&&module.exports&&(module.exports=fe),e.FinanceEvents=fe})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!t)throw new Error("FinanceEvents is required before FinanceLedger.");function n(C){return Array.isArray(C)?C:[]}function r(C){var F=C&&typeof C=="object"?C:{};return{baseCurrency:t.normalizeCurrency(F.baseCurrency,"EUR"),forecastDays:Number.isFinite(Number(F.forecastDays))?Math.max(1,Math.floor(Number(F.forecastDays))):90,nowIso:t.isIsoTimestamp(F.nowIso)?new Date(F.nowIso).toISOString():new Date().toISOString()}}function o(C){var F=String(C||"monthly").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return F==="week"?"weekly":F==="two_weekly"||F==="every_two_weeks"||F==="fortnightly"?"biweekly":F==="month"?"monthly":F==="quarter"?"quarterly":F==="annual"||F==="annually"?"yearly":["weekly","biweekly","monthly","quarterly","yearly"].includes(F)?F:"monthly"}function c(C,F){var Q=Math.abs(Number(C)||0),X=o(F);return X==="weekly"?t.roundMoney(Q*52/12):X==="biweekly"?t.roundMoney(Q*26/12):X==="quarterly"?t.roundMoney(Q/3):X==="yearly"?t.roundMoney(Q/12):t.roundMoney(Q)}function u(C){var F=String(C||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return F==="paused"||F==="pause"?"on_hold":F==="future"||F==="future_start"||F==="starts_later"?"starts_later":F==="complete"||F==="paid_off"?"completed":F==="archive"?"archived":F==="custom"?"irregular":["active","on_hold","starts_later","irregular","completed","archived","missing"].indexOf(F)!==-1?F:""}function m(C,F,Q){return C&&Object.prototype.hasOwnProperty.call(C,F)?C[F]!==!1:Q!==!1}function f(C,F){var Q=W(F),X=u(C&&C.planStatus),O=Math.max(0,Number(C&&C.paymentAmount)||Number(C&&C.minimumPayment)||0),U=Number.isFinite(Number(C&&C.customMonthlyPressure))&&Number(C.customMonthlyPressure)>0;X||(X=O>0||U?"active":"missing"),X==="missing"&&(O>0||U)&&(X="active");var V=W(C&&C.startDate),R=W(C&&C.endDate);return X==="active"&&R&&Q&&R<Q?"completed":X==="active"&&V&&Q&&V>Q?"starts_later":X}function y(C,F){var Q=f(C,F);if(["on_hold","starts_later","completed","archived","missing"].indexOf(Q)!==-1)return 0;var X=Number(C&&C.customMonthlyPressure);return Number.isFinite(X)&&X>0?t.roundMoney(X):Q==="irregular"?0:c(C&&C.paymentAmount,C&&C.paymentFrequency)}var h={lead:.15,proposal:.4,expected:.6,confirmed:.9,invoiced:.95,due:.95,overdue:.85,risky:.35,retainer:.9,recurring:.9,paid:1,cancelled:0,lost:0};function b(C){var F=String(C||"expected").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return F==="open"||F==="manual_expected_income"?"expected":F==="signed"||F==="verbal_commitment"?"confirmed":F==="invoice_sent"||F==="sent"?"invoiced":F==="received"||F==="settled"||F==="closed"?"paid":F==="deleted"?"cancelled":F==="opportunity"?"lead":["lead","proposal","expected","confirmed","invoiced","due","overdue","paid","cancelled","lost","risky"].indexOf(F)!==-1?F:"expected"}function _(C,F){var Q=String(F||"").toLowerCase();if(Q==="retainer"||Q==="recurring")return h[Q];var X=b(C);return h[X]!=null?h[X]:.6}function B(C,F,Q){return C&&Object.prototype.hasOwnProperty.call(C,"probability")&&Number.isFinite(Number(C.probability))?t.clampProbability(C.probability):_(F,Q)}function N(C,F,Q){if(!(!C||!F))if(Object.prototype.hasOwnProperty.call(F,"netAmount")?C.netAmount=Number.isFinite(Number(F.netAmount))?Number(F.netAmount):null:Object.prototype.hasOwnProperty.call(C,"netAmount")||(C.netAmount=null),Object.prototype.hasOwnProperty.call(F,"vatRate")?C.vatRate=Number.isFinite(Number(F.vatRate))?Number(F.vatRate):0:Object.prototype.hasOwnProperty.call(C,"vatRate")||(C.vatRate=0),Object.prototype.hasOwnProperty.call(F,"vatAmount")?C.vatAmount=Number.isFinite(Number(F.vatAmount))?Number(F.vatAmount):0:Object.prototype.hasOwnProperty.call(C,"vatAmount")||(C.vatAmount=0),Object.prototype.hasOwnProperty.call(F,"grossAmount")?C.grossAmount=Number.isFinite(Number(F.grossAmount))?Number(F.grossAmount):Q:Object.prototype.hasOwnProperty.call(C,"grossAmount")||(C.grossAmount=Q),Object.prototype.hasOwnProperty.call(F,"durationValue")?C.durationValue=Number.isFinite(Number(F.durationValue))?Math.max(0,Number(F.durationValue)):null:Object.prototype.hasOwnProperty.call(C,"durationValue")||(C.durationValue=null),Object.prototype.hasOwnProperty.call(F,"durationUnit")){var X=String(F.durationUnit||"").toLowerCase();C.durationUnit=["months","hours","times"].indexOf(X)!==-1?X:""}else Object.prototype.hasOwnProperty.call(C,"durationUnit")||(C.durationUnit="")}function x(C,F){var Q=b(C&&C.status);if(Q==="paid")return"settled";if(Q==="cancelled"||Q==="lost")return"inactive";var X=W(C&&C.expectedDateISO),O=W(F);if(!X||!O)return"upcoming";if(X<O){var U=Date.parse(O+"T00:00:00.000Z")-Date.parse(X+"T00:00:00.000Z");return U>336*60*60*1e3?"severely_overdue":"overdue"}if(Q==="overdue")return"overdue";if(X===O||Q==="due")return"due_today";var V=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(O,7):"";return V&&X<=V?"due_soon":"upcoming"}function q(C,F){var Q=t.normalizeCurrency(C&&C.currency,F);if(Q!==t.normalizeCurrency(F,"EUR"))throw new Error("Event currency must match base currency ("+F+").")}function H(C,F,Q,X){var O=r(Q),U=X||{},V=n(C).slice(),R=[];return n(F).forEach(function(Y){if(!(!Y||typeof Y!="object")){q(Y,O.baseCurrency);var oe=t.createFinancialEvent(Y,{baseCurrency:O.baseCurrency,nowIso:U.nowIso||O.nowIso,allowApproximateTimestamp:!!U.allowApproximateTimestamp});V.push(oe),R.push(oe)}}),{events:t.sortFinancialEvents(V),appended:R}}function fe(C,F,Q,X,O){var U=t.sortFinancialEvents(C),V=U.find(function(Y){return Y&&String(Y.id)===String(F)});if(!V)throw new Error("Cannot reverse missing finance event: "+F);var R={type:"finance.event_reversed",amount:0,currency:V.currency||X&&X.baseCurrency||"EUR",related_entity_id:String(V.id),timestamp:O&&O.timestamp||X&&X.nowIso||new Date().toISOString(),metadata:{reason:String(Q||"undo"),reversed_event_id:String(V.id)}};return H(C,[R],X,O)}function J(C){var F=t.sortFinancialEvents(C),Q=t.resolveReversedEventIds(F);return F.filter(function(X){return!X||X.type==="finance.event_reversed"?!1:!Q.has(String(X.id))})}function K(C){var F=b(C);return F!=="paid"&&F!=="lost"&&F!=="cancelled"}function W(C){return t.toDateOnly?t.toDateOnly(C):e.FinanceDates?e.FinanceDates.toDateOnly(C):""}function re(C,F){var Q=new Date(C);return!Number.isFinite(Q.getTime())||!Number.isFinite(Number(F))||Number(F)<=0?"":(Q.setUTCMonth(Q.getUTCMonth()+Math.ceil(Number(F))),Q.toISOString().slice(0,10))}function le(C,F){var Q=Math.max(0,Number(C&&C.outstanding)||0);if(Q<=0)return{estimatedPayoffMonths:0,estimatedPayoffDate:W(F)};if(String(C&&C.planType)==="custom"&&Array.isArray(C.installments)&&C.installments.length){for(var X=0,O=C.installments.slice().sort(function(Y,oe){return String(Y&&Y.date||"").localeCompare(String(oe&&oe.date||""))}),U=0;U<O.length;U+=1)if(X+=Math.max(0,Number(O[U]&&O[U].amount)||0),X>=Q)return{estimatedPayoffMonths:null,estimatedPayoffDate:W(O[U].date)}}var V=Math.max(0,Number(C&&C.minimumPaymentMonthly)||0);if(V<=0)return{estimatedPayoffMonths:null,estimatedPayoffDate:""};var R=Math.ceil(Q/V);return{estimatedPayoffMonths:R,estimatedPayoffDate:re(F,R)}}function Ne(C,F){var Q=r(F),X=Q.nowIso,O=Date.parse(X),U=720*60*60*1e3,V=J(C),R=Object.create(null),Y=Object.create(null),oe=Object.create(null),de=Object.create(null),xe=Object.create(null),Z=Object.create(null),Rt=Object.create(null),Wt=Object.create(null),_e=Object.create(null),et=Object.create(null),st=Object.create(null),Ot=[],on=Object.create(null),Nt=0;t.sortFinancialEvents(C).forEach(function(I){var d=I&&I.metadata&&typeof I.metadata=="object"?I.metadata:{};if(I&&I.type==="finance.event_reversed"){var A=String(d.reversed_event_id||I.related_entity_id||"").trim();A&&(on[A]=String(I.id||"").trim())}}),V.forEach(function(I){var d=I.metadata&&typeof I.metadata=="object"?I.metadata:{},A=String(I.related_entity_id||d.entity_id||d.id||I.id),ue=Number(I.amount)||0,lt=Date.parse(I.timestamp),dt=Number.isFinite(lt)?Math.max(0,O-lt):Number.POSITIVE_INFINITY;if(I.type==="income.received"||I.type==="expense.recorded"||I.type==="transfer.recorded"||I.type==="cash.adjusted"){var Re=String(d.direction||"").trim(),Ct=ue;I.type==="expense.recorded"&&(Re="out"),I.type==="income.received"&&(Re="in"),I.type==="transfer.recorded"&&(Re="transfer"),I.type==="cash.adjusted"&&(Re=Re==="decrease"?"out":"in"),(I.type==="expense.recorded"||I.type==="cash.adjusted"&&Re==="out")&&(Ct=-Math.abs(ue)),Ot.push({id:I.id,transactionEntityId:A,type:I.type,ledgerType:String(d.ledgerType||(I.type==="income.received"?"income":I.type==="expense.recorded"?"expense":I.type==="transfer.recorded"?"transfer":"adjustment")),direction:Re,description:String(d.description||I.type),amount:ue,signedAmount:Ct,currency:I.currency,accountId:String(d.accountId||"").trim(),accountName:String(d.accountName||"").trim(),fromAccountId:String(d.fromAccountId||"").trim(),fromAccountName:String(d.fromAccountName||"").trim(),toAccountId:String(d.toAccountId||"").trim(),toAccountName:String(d.toAccountName||"").trim(),categoryId:String(d.categoryId||"uncategorized"),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),source:String(d.source||"manual"),sourceFile:String(d.sourceFile||"").trim(),sourceRowId:String(d.sourceRowId||d.rowNumber||"").trim(),importBatchId:String(d.importBatchId||"").trim(),fingerprint:String(d.fingerprint||"").trim(),obligationId:String(d.obligationId||"").trim(),obligationDueDate:String(d.obligationDueDate||"").trim(),obligationTitle:String(d.obligationTitle||"").trim(),linkedIncomeId:String(d.invoiceId||d.pipelineId||d.linkedIncomeId||"").trim(),linkedDebtId:String(d.debtId||d.linkedDebtId||"").trim(),linkedReserveId:String(d.reserveBucketId||d.linkedReserveId||"").trim(),reversalOf:String(d.reversed_event_id||d.reversalOf||"").trim(),reversedBy:on[String(I.id||"")]||"",reviewStatus:String(d.reviewStatus||"").trim()||(String(d.categoryId||"uncategorized").toLowerCase()==="uncategorized"?"needs_review":"clear"),reviewNotes:"",timestamp:I.timestamp})}if(I.type==="project.profile_set"){st[A]={id:A,name:String(d.name||"Project plan"),clientOrPurpose:String(d.clientOrPurpose||d.purpose||""),status:String(d.status||"active").toLowerCase()==="archived"?"archived":"active",color:String(d.color||"mint"),notes:String(d.notes||""),createdAt:String(d.createdAt||I.timestamp),updatedAt:I.timestamp};return}if(I.type==="income.received"&&dt<=U&&(Nt+=t.toMinor(ue)),I.type==="pipeline.created"){var ut=b(d.stage||d.status||"expected"),sn=String(d.incomeType||d.type||"one_off");R[A]={id:A,title:String(d.title||d.name||d.client||"Pipeline Item"),value:Number.isFinite(Number(d.value))?Number(d.value):ue,probability:B(d,ut,sn),status:ut,expectedDateISO:W(d.expectedDateISO||d.expectedDate||I.timestamp),destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),incomeType:sn,scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),scenarioInclusion:String(d.scenarioInclusion||"realistic"),currency:I.currency,dueState:"",createdAt:I.timestamp,updatedAt:I.timestamp},N(R[A],d,R[A].value);return}if(I.type==="pipeline.stage_changed"){var he=b(d.stage||d.status||"expected"),We=String(d.incomeType||d.type||"one_off");R[A]||(R[A]={id:A,title:String(d.title||d.name||"Pipeline Item"),value:0,probability:B(d,he,We),status:he,expectedDateISO:W(d.expectedDateISO||d.expectedDate||I.timestamp),destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),incomeType:We,scope:String(d.scope||"shared"),scenarioInclusion:String(d.scenarioInclusion||"realistic"),currency:I.currency,dueState:"",createdAt:I.timestamp,updatedAt:I.timestamp},N(R[A],d,R[A].value)),R[A].status=b(d.stage||d.status||R[A].status||"expected"),R[A].scope=String(d.scope||R[A].scope||"shared"),Object.prototype.hasOwnProperty.call(d,"projectId")?R[A].projectId=String(d.projectId||"").trim():R[A].projectId=R[A].projectId||"",(d.expectedDateISO||d.expectedDate)&&(R[A].expectedDateISO=W(d.expectedDateISO||d.expectedDate)),(d.title||d.name)&&(R[A].title=String(d.title||d.name)),d.scenarioInclusion&&(R[A].scenarioInclusion=String(d.scenarioInclusion)),Object.prototype.hasOwnProperty.call(d,"destinationAccountId")&&(R[A].destinationAccountId=String(d.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(d,"destinationAccountName")&&(R[A].destinationAccountName=String(d.destinationAccountName||"").trim()),(d.incomeType||d.type)&&(R[A].incomeType=String(d.incomeType||d.type)),N(R[A],d,R[A].value),R[A].updatedAt=I.timestamp;return}if(I.type==="pipeline.value_changed"){var je=b(d.stage||d.status||"expected"),Be=String(d.incomeType||d.type||"one_off");R[A]||(R[A]={id:A,title:String(d.title||d.name||"Pipeline Item"),value:0,probability:B(d,je,Be),status:je,expectedDateISO:W(d.expectedDateISO||d.expectedDate||I.timestamp),destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),incomeType:Be,scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),scenarioInclusion:String(d.scenarioInclusion||"realistic"),currency:I.currency,dueState:"",createdAt:I.timestamp,updatedAt:I.timestamp},N(R[A],d,R[A].value)),R[A].value=Number.isFinite(Number(d.value))?Number(d.value):ue,R[A].scope=String(d.scope||R[A].scope||"shared"),Object.prototype.hasOwnProperty.call(d,"projectId")?R[A].projectId=String(d.projectId||"").trim():R[A].projectId=R[A].projectId||"",(d.expectedDateISO||d.expectedDate)&&(R[A].expectedDateISO=W(d.expectedDateISO||d.expectedDate)),(d.title||d.name)&&(R[A].title=String(d.title||d.name)),d.scenarioInclusion&&(R[A].scenarioInclusion=String(d.scenarioInclusion)),Object.prototype.hasOwnProperty.call(d,"destinationAccountId")&&(R[A].destinationAccountId=String(d.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(d,"destinationAccountName")&&(R[A].destinationAccountName=String(d.destinationAccountName||"").trim()),(d.incomeType||d.type)&&(R[A].incomeType=String(d.incomeType||d.type)),N(R[A],d,R[A].value),R[A].updatedAt=I.timestamp;return}if(I.type==="pipeline.probability_changed"){var Lt=b(d.stage||d.status||"expected"),Yt=String(d.incomeType||d.type||"one_off");R[A]||(R[A]={id:A,title:String(d.title||d.name||"Pipeline Item"),value:Number.isFinite(Number(d.value))?Number(d.value):ue,probability:B(d,Lt,Yt),status:Lt,expectedDateISO:W(d.expectedDateISO||d.expectedDate||I.timestamp),destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),incomeType:Yt,scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),scenarioInclusion:String(d.scenarioInclusion||"realistic"),currency:I.currency,dueState:"",createdAt:I.timestamp,updatedAt:I.timestamp},N(R[A],d,R[A].value)),R[A].probability=t.clampProbability(d.probability!=null?d.probability:ue),R[A].scope=String(d.scope||R[A].scope||"shared"),Object.prototype.hasOwnProperty.call(d,"projectId")?R[A].projectId=String(d.projectId||"").trim():R[A].projectId=R[A].projectId||"",(d.expectedDateISO||d.expectedDate)&&(R[A].expectedDateISO=W(d.expectedDateISO||d.expectedDate)),d.scenarioInclusion&&(R[A].scenarioInclusion=String(d.scenarioInclusion)),Object.prototype.hasOwnProperty.call(d,"destinationAccountId")&&(R[A].destinationAccountId=String(d.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(d,"destinationAccountName")&&(R[A].destinationAccountName=String(d.destinationAccountName||"").trim()),(d.incomeType||d.type)&&(R[A].incomeType=String(d.incomeType||d.type)),N(R[A],d,R[A].value),R[A].updatedAt=I.timestamp;return}if(I.type==="invoice.sent"){Y[A]={id:A,client:String(d.client||d.title||d.name||"Invoice"),amount:Number.isFinite(Number(d.amount))?Number(d.amount):ue,expectedDate:W(d.expectedDate||d.expectedDateISO||I.timestamp),status:String(d.status||"Sent"),destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),currency:I.currency,sentAt:I.timestamp,paidAt:null};return}if(I.type==="invoice.paid"){Y[A]||(Y[A]={id:A,client:String(d.client||d.title||d.name||"Invoice"),amount:Number.isFinite(Number(d.amount))?Number(d.amount):ue,expectedDate:W(d.expectedDate||d.expectedDateISO||I.timestamp),status:"Paid",destinationAccountId:String(d.destinationAccountId||"").trim(),destinationAccountName:String(d.destinationAccountName||"").trim(),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),currency:I.currency,sentAt:I.timestamp,paidAt:I.timestamp}),Y[A].status="Paid",Y[A].paidAt=I.timestamp,Y[A].scope=String(d.scope||Y[A].scope||"shared"),Object.prototype.hasOwnProperty.call(d,"projectId")?Y[A].projectId=String(d.projectId||"").trim():Y[A].projectId=Y[A].projectId||"",Number.isFinite(Number(d.amount))&&(Y[A].amount=Number(d.amount)),Object.prototype.hasOwnProperty.call(d,"destinationAccountId")&&(Y[A].destinationAccountId=String(d.destinationAccountId||"").trim()),Object.prototype.hasOwnProperty.call(d,"destinationAccountName")&&(Y[A].destinationAccountName=String(d.destinationAccountName||"").trim());return}if(I.type==="expense.recurring_set"){var cn=o(d.frequency),wt=Number.isFinite(Number(d.amount))?Math.abs(Number(d.amount)):Math.abs(ue),St=Number.isFinite(Number(d.monthlyAmount))?Math.abs(Number(d.monthlyAmount)):c(wt,cn);oe[A]={id:A,category:String(d.category||d.name||"Recurring Expense"),amount:wt,monthlyAmount:St,essential:!!d.essential,active:d.active!==!1,dueDay:Math.max(1,Math.min(28,Number(d.dueDay)||1)),frequency:cn,linkedDebtId:String(d.linkedDebtId||d.debtId||"").trim(),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),currency:I.currency,updatedAt:I.timestamp};return}if(I.type==="obligation.reviewed"){de[A]={id:A,status:String(d.status||"needs_review").toLowerCase(),title:String(d.title||"Obligation"),amount:Number.isFinite(Number(d.amount))?Number(d.amount):ue,dueDate:String(d.dueDate||""),paidAt:String(d.paidAt||""),deferredUntil:String(d.deferredUntil||""),accountId:String(d.accountId||""),accountName:String(d.accountName||""),transactionId:String(d.transactionId||""),notes:String(d.notes||""),reviewedAt:I.timestamp,currency:I.currency,scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim()};return}if(I.type==="transaction.reviewed"){xe[A]={id:A,categoryId:String(d.categoryId||"").trim(),scope:String(d.scope||"").trim(),reviewStatus:String(d.reviewStatus||"reviewed").trim(),notes:String(d.notes||""),obligationId:String(d.obligationId||"").trim(),obligationTitle:String(d.obligationTitle||"").trim(),linkedIncomeId:String(d.linkedIncomeId||"").trim(),linkedReserveId:String(d.linkedReserveId||"").trim(),linkedDebtId:String(d.linkedDebtId||"").trim(),projectId:String(d.projectId||"").trim(),reviewedAt:I.timestamp};return}if(I.type==="debt.added"||I.type==="debt.payment_made"||I.type==="debt.plan_updated"){Z[A]||(Z[A]={id:A,name:String(d.name||d.lender||"Debt"),totalAdded:0,totalPaid:0,outstanding:0,dueDate:"",minimumPayment:0,minimumPaymentMonthly:0,monthlyPressure:0,paymentAmount:0,paymentFrequency:"monthly",paymentPlanNote:"",planType:"regular",planStatus:"missing",startDate:"",endDate:"",customMonthlyPressure:null,includeInBurnRate:!0,includeInSafeToSpend:!0,includeInRunway:!0,frequency:"monthly",installments:[],planReviewedAt:"",scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),currency:I.currency,updatedAt:I.timestamp}),I.type==="debt.added"?(Z[A].totalAdded+=Math.max(0,ue),d.dueDate&&(Z[A].dueDate=W(d.dueDate)),Number.isFinite(Number(d.minimumPayment))&&(Z[A].minimumPayment=Math.max(0,Number(d.minimumPayment))),d.paymentPlanNote&&(Z[A].paymentPlanNote=String(d.paymentPlanNote)),Z[A].frequency=o(d.frequency||Z[A].frequency),Z[A].paymentFrequency=o(d.paymentFrequency||d.frequency||Z[A].paymentFrequency),Z[A].paymentAmount=Number.isFinite(Number(d.paymentAmount))?Math.max(0,Number(d.paymentAmount)):Z[A].minimumPayment):I.type==="debt.payment_made"?Z[A].totalPaid+=Math.max(0,ue):(d.dueDate&&(Z[A].dueDate=W(d.dueDate)),Z[A].minimumPayment=Math.max(0,Number(d.minimumPayment)||0),Z[A].paymentAmount=Math.max(0,Number(d.paymentAmount!=null?d.paymentAmount:d.minimumPayment)||0),Z[A].paymentPlanNote=String(d.paymentPlanNote||""),Z[A].planType=String(d.planType||"regular"),Z[A].frequency=o(d.frequency),Z[A].paymentFrequency=o(d.paymentFrequency||d.frequency),Z[A].installments=Array.isArray(d.installments)?d.installments:[],Z[A].planStatus=u(d.planStatus||d.status)||(Z[A].paymentAmount>0?"active":"missing"),Z[A].startDate=W(d.startDate||"")||"",Z[A].endDate=W(d.endDate||"")||"",Z[A].customMonthlyPressure=Number.isFinite(Number(d.customMonthlyPressure))?Math.max(0,Number(d.customMonthlyPressure)):null,Z[A].includeInBurnRate=m(d,"includeInBurnRate",!0),Z[A].includeInSafeToSpend=m(d,"includeInSafeToSpend",!0),Z[A].includeInRunway=m(d,"includeInRunway",!0),Z[A].planReviewedAt=I.timestamp),Z[A].outstanding=Math.max(0,Z[A].totalAdded-Z[A].totalPaid),!Z[A].paymentAmount&&Z[A].minimumPayment>0&&(Z[A].paymentAmount=Z[A].minimumPayment),Z[A].paymentFrequency=o(Z[A].paymentFrequency||Z[A].frequency),Z[A].planStatus=f(Z[A],X),Z[A].minimumPaymentMonthly=c(Z[A].paymentAmount,Z[A].paymentFrequency),Z[A].monthlyPressure=y(Z[A],X),Object.assign(Z[A],le(Z[A],X)),Z[A].scope=String(d.scope||Z[A].scope||"shared"),Object.prototype.hasOwnProperty.call(d,"projectId")?Z[A].projectId=String(d.projectId||"").trim():Z[A].projectId=Z[A].projectId||"",Z[A].updatedAt=I.timestamp;return}if(I.type==="asset.account_set"){Rt[A]={id:A,name:String(d.name||"Account"),balance:Number.isFinite(Number(d.balance))?Number(d.balance):ue,currency:I.currency,active:d.active!==!1,scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),bucket:String(d.bucket||d.reserveBucket||"available"),reserved:!!d.reserved||d.bucket&&String(d.bucket)!=="available",updatedAt:I.timestamp};return}if(I.type==="asset.position_set"){Wt[A]={id:A,symbolOrName:String(d.symbolOrName||d.symbol||"TOKEN"),amount:Number.isFinite(Number(d.amount))?Number(d.amount):0,price:Number.isFinite(Number(d.price))?Number(d.price):0,liquidity:String(d.liquidity||"med"),chain:String(d.chain||"Unknown"),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),priceSource:String(d.priceSource||"manual"),priceUpdatedAt:String(d.priceUpdatedAt||I.timestamp),manualPriceOverride:d.manualPriceOverride!==!1,updatedAt:I.timestamp};return}if(I.type==="asset.defi_set"){_e[A]={id:A,protocol:String(d.protocol||d.name||"Protocol"),collateralValue:Number.isFinite(Number(d.collateralValue))?Number(d.collateralValue):0,debtValue:Number.isFinite(Number(d.debtValue))?Number(d.debtValue):0,riskScore:String(d.riskScore||"Low"),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),updatedAt:I.timestamp};return}if(I.type==="asset.reserve_set"){et[A]={id:A,name:String(d.name||"Reserve"),targetAmount:Number.isFinite(Number(d.targetAmount))?Number(d.targetAmount):ue,currentAmount:Number.isFinite(Number(d.currentAmount))?Number(d.currentAmount):ue,linkedCashAccountId:String(d.linkedCashAccountId||"").trim()||null,purpose:String(d.purpose||"custom"),priority:String(d.priority||"medium"),scope:String(d.scope||"shared"),projectId:String(d.projectId||"").trim(),notes:String(d.notes||""),active:d.active!==!1,updatedAt:I.timestamp};return}if(I.type==="asset.reserve_allocated"){if(!et[A])return;Number.isFinite(Number(d.currentAmount))?et[A].currentAmount=Number(d.currentAmount):Number.isFinite(ue)&&(et[A].currentAmount=ue),et[A].updatedAt=I.timestamp,Object.prototype.hasOwnProperty.call(d,"projectId")&&(et[A].projectId=String(d.projectId||"").trim());return}});var _t=Object.keys(st).map(function(I){return st[I]}),tt=Object.keys(R).map(function(I){return R[I]});tt.forEach(function(I){I.status=b(I.status),I.probability=Number.isFinite(Number(I.probability))?t.clampProbability(I.probability):_(I.status,I.incomeType),I.dueState=x(I,Q.nowIso)});var gn=Object.keys(oe).map(function(I){return oe[I]}),He=Object.keys(de).map(function(I){return de[I]}),Gt=gn.filter(function(I){return I&&I.active!==!1}),Kt=Object.keys(Z).map(function(I){return Z[I]}),G=Object.keys(Y).map(function(I){return Y[I]}),Fe=Object.keys(et).map(function(I){return et[I]}),j=Object.create(null);Object.keys(de).forEach(function(I){var d=de[I];d&&d.transactionId&&(j[String(d.transactionId)]=d)}),Ot=Ot.map(function(I){var d=xe[String(I.id)]||xe[String(I.transactionEntityId)]||null,A=j[String(I.id)]||j[String(I.transactionEntityId)]||null,ue=d&&d.categoryId?d.categoryId:I.categoryId,lt=d&&d.scope?d.scope:I.scope,dt=I.obligationId||d&&d.obligationId||A&&A.id||"",Re=d&&Object.prototype.hasOwnProperty.call(d,"linkedIncomeId")?d.linkedIncomeId:I.linkedIncomeId,Ct=d&&Object.prototype.hasOwnProperty.call(d,"linkedReserveId")?d.linkedReserveId:I.linkedReserveId,ut=d&&Object.prototype.hasOwnProperty.call(d,"linkedDebtId")?d.linkedDebtId:I.linkedDebtId,sn=d&&Object.prototype.hasOwnProperty.call(d,"projectId")?d.projectId:I.projectId,he=Re&&(R[String(Re)]||Y[String(Re)])||null,We=dt&&(oe[String(dt).replace(/-\d{4}-\d{2}$/,"")]||A)||null,je=ut&&Z[String(ut)]||null;return Object.assign({},I,{categoryId:ue,scope:lt,obligationId:dt,linkedIncomeId:Re||"",linkedReserveId:Ct||"",linkedDebtId:ut||"",projectId:sn||"",obligationTitle:I.obligationTitle||d&&d.obligationTitle||A&&A.title||"",linkedIncomeTitle:he?String(he.title||he.client||"Linked income"):"",linkedDebtTitle:je?String(je.name||"Linked debt"):"",linkedObligationTitle:We?String(We.title||We.category||"Linked obligation"):"",reviewStatus:d&&d.reviewStatus?d.reviewStatus:String(ue||"").toLowerCase()==="uncategorized"?"needs_review":dt?"reviewed":I.reviewStatus,reviewNotes:d&&d.notes?d.notes:I.reviewNotes})}),Ot.sort(function(I,d){return(Date.parse(d.timestamp||"")||0)-(Date.parse(I.timestamp||"")||0)}),tt.sort(function(I,d){var A=Date.parse(I.expectedDateISO||"")||0,ue=Date.parse(d.expectedDateISO||"")||0;return A!==ue?A-ue:String(I.id).localeCompare(String(d.id))}),G.sort(function(I,d){var A=Date.parse(I.expectedDate||"")||0,ue=Date.parse(d.expectedDate||"")||0;return A!==ue?A-ue:String(I.id).localeCompare(String(d.id))}),_t.sort(function(I,d){return String(I.status||"")!==String(d.status||"")?String(I.status||"").localeCompare(String(d.status||"")):String(I.name||"").localeCompare(String(d.name||""))});var Dt=Gt.reduce(function(I,d){return I+(Number(d.monthlyAmount)||0)},0),yt=tt.filter(function(I){return K(I.status)}).reduce(function(I,d){return I+(Number(d.value)||0)*t.clampProbability(d.probability)},0),jt=new Date(O);jt.setDate(jt.getDate()+Q.forecastDays);var nt=tt.filter(function(I){return K(I.status)}).filter(function(I){var d=Date.parse(I.expectedDateISO||"");return Number.isFinite(d)?d>=O&&d<=jt.getTime():!1}).reduce(function(I,d){return I+(Number(d.value)||0)*t.clampProbability(d.probability)},0),Bt=Kt.reduce(function(I,d){return I+Math.max(0,Number(d.outstanding)||0)},0),Ze=Object.keys(Rt).map(function(I){return Rt[I]}).filter(function(I){return I&&I.active!==!1}),ve=Object.keys(Wt).map(function(I){return Wt[I]}),ct=Object.keys(_e).map(function(I){return _e[I]});return{currency:Q.baseCurrency,asOf:Q.nowIso,eventsCount:V.length,projectProfiles:_t,pipelineDeals:tt,recurringExpenses:Gt,obligationReviews:He,debtAccounts:Kt,invoices:G,transactions:Ot,fiatAccounts:Ze,reserveBuckets:Fe.filter(function(I){return I&&I.active!==!1}),web3Positions:ve,defiPositions:ct,recurringMonthlyTotal:t.roundMoney(Dt),weightedPipeline:t.roundMoney(yt),expectedPipeline90d:t.roundMoney(nt),debtTotal:t.roundMoney(Bt),incomeReceivedLast30Days:t.fromMinor(Nt),monthlyIncomeEstimate:t.roundMoney(t.fromMinor(Nt)+nt),invoicesSentCount:G.filter(function(I){return String(I.status||"").toLowerCase()!=="paid"}).length,openPipelineCount:tt.filter(function(I){return K(I.status)}).length}}var Ae={normalizeSettings:r,appendEvents:H,reverseEvent:fe,getActiveEvents:J,buildReadModel:Ne,isPipelineActive:K,normalizeFrequency:o,normalizeRecurrenceMonthlyAmount:c};typeof module<"u"&&module.exports&&(module.exports=Ae),e.FinanceLedger=Ae})(typeof window<"u"?window:globalThis);(function(e){function t(c){var u=Number(c);return Number.isFinite(u)?Math.round(u*100)/100:0}function n(c,u,m){var f=Number.isFinite(Number(m))?Number(m):.01;return Math.abs((Number(c)||0)-(Number(u)||0))<=f}function r(c){var u=c&&typeof c=="object"?c:{},m=u.snapshot&&typeof u.snapshot=="object"?u.snapshot:{},f=u.components&&typeof u.components=="object"?u.components:{},y=[],h=t(f.realBalanceFromSums);if(n(m.realBalance,h,.01)||y.push({id:"real-balance-consistency",message:"Real balance does not match ledger sums.",expected:h,actual:t(m.realBalance),severity:"high"}),m.monthlyBurn==null)m.runwayMonths!==null&&y.push({id:"runway-null-when-burn-missing",message:"Runway must be null when monthly burn is undefined.",expected:null,actual:m.runwayMonths,severity:"medium"});else if(Number(m.monthlyBurn)===0)m.runwayMonths!==null&&y.push({id:"runway-null-when-burn-zero",message:"Runway must be null when monthly burn is zero.",expected:null,actual:m.runwayMonths,severity:"medium"});else{var b=Number.isFinite(Number(m.availableCash))?Number(m.availableCash):Number.isFinite(Number(m.trulyAvailableCash))?Number(m.trulyAvailableCash):Number(m.realBalance),_=t((b||0)/(Number(m.monthlyBurn)||1));n(m.runwayMonths,_,.01)||y.push({id:"runway-formula",message:"Runway is inconsistent with available cash / burn.",expected:_,actual:t(m.runwayMonths),severity:"high"})}var B=t(f.weightedPipelineFromDeals);n(m.weightedPipeline,B,.01)||y.push({id:"pipeline-sum-consistency",message:"Weighted pipeline does not match deal list.",expected:B,actual:t(m.weightedPipeline),severity:"high"});var N=t(f.totalDebtFromLiabilities);return n(m.totalDebt,N,.01)||y.push({id:"debt-total-consistency",message:"Debt total does not match liability ledger.",expected:N,actual:t(m.totalDebt),severity:"high"}),{ok:y.length===0,violations:y,messages:y.map(function(x){return x.message})}}var o={evaluateFinancialInvariants:r};typeof module<"u"&&module.exports&&(module.exports=o),e.FinanceInvariants=o})(typeof window<"u"?window:globalThis);(function(e){function t(u){var m=Number(u);return!Number.isFinite(m)||m<0?0:m>1?1:m}function n(u){var m=t(u);return m>=.75?"HIGH":m>=.45?"MEDIUM":"LOW"}function r(u){var m=new Set,f=[];return(Array.isArray(u)?u:[]).forEach(function(y){var h=String(y||"").trim();!h||m.has(h)||(m.add(h),f.push(h))}),f}function o(u){var m=u&&typeof u=="object"?u:{},f=1,y=[],h=[];m.missingRecurringExpenses&&(f-=.12,y.push("recurring expenses"),h.push("Missing recurring expenses configuration.")),m.noRecentData&&(f-=.15,y.push("recent financial activity"),h.push("No recent finance data in last 30 days.")),m.undefinedBurn&&(f-=.25,y.push("monthly burn"),h.push("Monthly burn is undefined.")),m.emptyPipeline&&(f-=.1,y.push("pipeline"),h.push("Pipeline is empty.")),m.staleCompute&&(f-=.08,y.push("compute freshness"),h.push("Snapshot is stale versus latest event timestamp."));var b=Array.isArray(m.invariantViolations)?m.invariantViolations.length:0;return b>0&&(f-=Math.min(.4,b*.1),h.push("Invariant checks reported "+b+" violation(s).")),f=t(f),{score:f,level:n(f),missingInputs:r((m.missingInputs||[]).concat(y)),reasons:h}}var c={clamp01:t,confidenceLevel:n,computeConfidenceScore:o};typeof module<"u"&&module.exports&&(module.exports=c),e.FinanceConfidence=c})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,r=e.FinanceInvariants,o=e.FinanceConfidence;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!r&&typeof module<"u"&&module.exports&&(r=require("./invariants.js")),!o&&typeof module<"u"&&module.exports&&(o=require("./confidence.js")),!t||!n||!r||!o)throw new Error("FinanceCompute dependencies are missing.");function c(U){return n.normalizeSettings(U||{})}function u(U){return Array.isArray(U)?U:[]}function m(U,V,R){var Y=Date.parse(U);if(!Number.isFinite(Y))return!1;var oe=V-Y;return oe>=0&&oe<=R*24*60*60*1e3}function f(U,V,R){var Y=Date.parse(U);return Number.isFinite(Y)?Y>=V&&Y<=R:!1}function y(U){return n.isPipelineActive(U)}function h(U,V){var R=Number(U);return Number.isFinite(R)?R:Number.isFinite(Number(V))?Number(V):0}function b(U){return t.roundMoney(U)}var _=["tax_reserve","vat_reserve","health_insurance","debt_repayment","personal_survival","business_operating_costs","investment_growth","buffer"];function B(U){var V=String(U||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return V?V==="tax"||V==="taxes"?"tax_reserve":V==="vat"?"vat_reserve":V==="health"||V==="insurance"?"health_insurance":V==="debt"?"debt_repayment":V==="survival"?"personal_survival":V==="business"||V==="operating"?"business_operating_costs":V==="growth"||V==="investment"?"investment_growth":V==="safety_buffer"||V==="safety"?"buffer":V:"available"}function N(U){var V={available:"Available",tax_reserve:"Tax reserve",vat_reserve:"VAT reserve",health_insurance:"Health insurance",debt_repayment:"Debt repayment",personal_survival:"Personal survival",business_operating_costs:"Business operating costs",investment_growth:"Investment growth",buffer:"Buffer"};return V[U]||String(U||"available").replace(/_/g," ")}function x(U,V){var R=e.FinanceDates&&e.FinanceDates.toDateOnly(U);if(R&&e.FinanceDates&&e.FinanceDates.addDaysDateOnly)return new Date(e.FinanceDates.dateOnlyToNoonIso(e.FinanceDates.addDaysDateOnly(R,V)));var Y=new Date(U);return Y.setUTCDate(Y.getUTCDate()+V),Y}function q(U){return e.FinanceDates&&e.FinanceDates.toDateOnly?e.FinanceDates.toDateOnly(U):""}function H(U){var V=new Date(U);return new Date(V.getFullYear(),V.getMonth(),1,0,0,0,0)}function fe(U){var V=new Date(U);return new Date(V.getFullYear(),V.getMonth()+1,0,23,59,59,999)}function J(U){var V=String(U&&U.status||"expected").toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return V==="open"||V==="manual_expected_income"?"expected":V==="signed"||V==="verbal_commitment"?"confirmed":V==="invoice_sent"||V==="sent"?"invoiced":V==="received"||V==="settled"||V==="closed"?"paid":V==="deleted"?"cancelled":V==="opportunity"?"lead":["lead","proposal","expected","confirmed","invoiced","due","overdue","paid","cancelled","lost","risky"].indexOf(V)!==-1?V:"expected"}function K(U,V,R){if(U&&U.dueState)return String(U.dueState);if(V==="paid")return"settled";if(V==="cancelled"||V==="lost")return"inactive";var Y=q(U&&U.expectedDateISO),oe=q(R);if(!Y||!oe)return"upcoming";if(Y<oe){var de=Date.parse(oe+"T00:00:00.000Z")-Date.parse(Y+"T00:00:00.000Z");return de>336*60*60*1e3?"severely_overdue":"overdue"}if(V==="overdue")return"overdue";if(Y===oe||V==="due")return"due_today";var xe=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(oe,7):q(x(R,7));return xe&&Y<=xe?"due_soon":"upcoming"}function W(U,V){var R=String(U&&U.status||""),Y=t.clampProbability(U&&U.probability),oe=String(U&&U.incomeType||"").toLowerCase();return R==="paid"||R==="cancelled"||R==="lost"?!1:V==="conservative"?["confirmed","invoiced","due","overdue"].indexOf(R)!==-1&&Y>=.85:V==="expected"?W(U,"conservative")||(R==="expected"||oe==="retainer"||oe==="recurring")&&Y>=.5:V==="optimistic"?W(U,"expected")||["proposal","lead","risky"].indexOf(R)!==-1&&Y>0:!1}function re(U,V){var R=q(U),Y=q(V);if(!R||!Y)return"needs_review";if(R<Y)return"overdue";var oe=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(Y,7):q(x(V,7));return R<=oe?"due_soon":"upcoming"}function le(U,V,R,Y,oe){return{key:U,label:V,value:b(Number(R)||0),parts:u(Y).map(function(de){return{label:String(de&&de.label||""),value:b(Number(de&&de.value)||0),operation:de&&de.operation?String(de.operation):void 0}}),warnings:u(oe).map(function(de){return String(de||"")}).filter(Boolean)}}function Ne(U){var V=Object.create(null);return u(U).forEach(function(R){if(String(R&&R.type)==="income.received"){var Y=String(R&&R.linkedIncomeId||"").trim();Y&&(V[Y]=!0)}}),V}function Ae(U){return b(Math.max(0,Number(U&&U.monthlyPressure)||0))}function C(U,V){var R=Number(U&&U.outstanding)||0;return R<=0||Ae(U)<=0||String(U&&U.planStatus||"")==="archived"||String(U&&U.planStatus||"")==="completed"?!1:U&&U[V]!==!1}function F(U,V,R,Y){var oe=u(U.fiatAccounts),de=u(U.recurringExpenses),xe=Object.create(null);u(U.obligationReviews).forEach(function(p){!p||!p.id||(xe[String(p.id)]=p)});var Z=u(U.transactions),Rt=Ne(Z),Wt=u(U.pipelineDeals).filter(function(p){return y(p&&p.status)&&Rt[String(p&&p.id||"")]!==!0}),_e=u(U.debtAccounts),et=Object.create(null),st=_e.filter(function(p){return C(p,"includeInBurnRate")?(et[String(p&&p.id||"")]=!0,!0):!1}),Ot=_e.filter(function(p){return C(p,"includeInRunway")}),on=_e.filter(function(p){return C(p,"includeInSafeToSpend")}),Nt=de.filter(function(p){var ee=String(p&&p.linkedDebtId||"").trim();return!ee||et[ee]!==!0}),_t=H(Y).getTime(),tt=fe(Y).getTime(),gn=x(Y,R.forecastDays).getTime(),He=Object.create(null),Gt=0,Kt=0;oe.forEach(function(p){var ee=Number(p&&p.balance)||0,be=B(p&&p.bucket),Le=be!=="available"||!!(p&&p.reserved);Gt+=ee,Le&&(Kt+=ee,He[be]||(He[be]={bucket:be,label:N(be),amount:0}),He[be].amount+=ee)}),_.forEach(function(p){He[p]||(He[p]={bucket:p,label:N(p),amount:0})});var G=Object.keys(He).map(function(p){return{bucket:p,label:He[p].label,amount:b(He[p].amount)}}).sort(function(p,ee){var be=_.indexOf(p.bucket),Le=_.indexOf(ee.bucket);return be!==Le?(be===-1?999:be)-(Le===-1?999:Le):String(p.label).localeCompare(String(ee.label))}),Fe=Nt.filter(function(p){return String(p&&p.scope||"").toLowerCase()==="personal"||String(p&&p.scope||"").toLowerCase()==="shared"}).reduce(function(p,ee){return p+(Number(ee&&ee.monthlyAmount)||0)},0),j=Nt.filter(function(p){return String(p&&p.scope||"").toLowerCase()==="business"||String(p&&p.scope||"").toLowerCase()==="shared"}).reduce(function(p,ee){return p+(Number(ee&&ee.monthlyAmount)||0)},0);st.forEach(function(p){var ee=Ae(p),be=String(p&&p.scope||"shared").toLowerCase();(be==="personal"||be==="shared")&&(Fe+=ee),(be==="business"||be==="shared")&&(j+=ee)});var Dt=Nt.reduce(function(p,ee){return p+(Number(ee&&ee.monthlyAmount)||0)},0),yt=st.reduce(function(p,ee){return p+Ae(ee)},0),jt=Ot.reduce(function(p,ee){return p+Ae(ee)},0),nt=Dt+yt,Bt=Dt+jt,Ze=[],ve=q(Y),ct=ve?ve.split("-").map(Number):[],I=q(gn),d=e.FinanceDates&&e.FinanceDates.addDaysDateOnly?e.FinanceDates.addDaysDateOnly(ve,-30):q(x(Y,-30));Nt.forEach(function(p){for(var ee=Math.max(1,Math.min(28,Number(p&&p.dueDay)||1)),be=0;be<4;be+=1){var Le=new Date(Date.UTC(ct[0]||new Date(Y).getUTCFullYear(),(ct[1]||new Date(Y).getUTCMonth()+1)-1+be,ee,12,0,0,0)),xt=e.FinanceDates&&e.FinanceDates.dateOnlyFromParts?e.FinanceDates.dateOnlyFromParts(Le.getUTCFullYear(),Le.getUTCMonth()+1,Le.getUTCDate()):Le.toISOString().slice(0,10);if(!(I&&xt>I)&&(be>0||!d||xt>=d)){var Kn=String(p&&p.id||"expense")+"-"+xt.slice(0,7),Zt=xe[Kn]||null,Yn=xt,Qn=re(xt,Y);Zt&&Zt.status==="paid"?Qn="paid":Zt&&Zt.status==="deferred"&&Zt.deferredUntil?(Yn=q(Zt.deferredUntil)||Yn,Qn=re(Yn,Y)):Zt&&Zt.status==="needs_review"&&(Qn="needs_review"),Ze.push({id:Kn,sourceId:String(p&&p.id||"expense"),title:String(p&&p.category||"Recurring cost"),type:"recurring_cost",amount:b(Number(p&&p.monthlyAmount)||0),dueDate:Yn,originalDueDate:xt,status:Qn,review:Zt,scope:String(p&&p.scope||"shared")})}}}),_e.forEach(function(p){var ee=Number(p&&p.outstanding)||0;if(!(ee<=0)){var be=String(p&&p.planStatus||"missing");if(!(be==="archived"||be==="completed")){var Le=q(be==="starts_later"&&p&&p.startDate||p&&p.dueDate),xt=Ae(p);if(!((be==="on_hold"||be==="irregular")&&xt<=0)){var Kn=xt>0||be==="on_hold"||be==="starts_later"||be==="irregular";Ze.push({id:String(p&&p.id||"debt"),title:String(p&&p.name||"Debt repayment"),type:"debt",amount:b((Number(p&&p.paymentAmount)||Number(p&&p.minimumPayment)||0)>0?Number(p&&p.paymentAmount)||Number(p&&p.minimumPayment):ee),dueDate:Le,planStatus:be,monthlyPressure:xt,status:Kn?xt>0?re(Le,Y):be:"needs_review",scope:String(p&&p.scope||"shared")})}}}}),Ze.sort(function(p,ee){var be=Date.parse(p.dueDate||"")||Number.MAX_SAFE_INTEGER,Le=Date.parse(ee.dueDate||"")||Number.MAX_SAFE_INTEGER;return be-Le});var A=Wt.map(function(p){var ee=J(p),be=t.clampProbability(p&&p.probability),Le=Number.isFinite(Number(p&&p.grossAmount))?b(Number(p&&p.grossAmount)):b(Number(p&&p.value)||0);return{id:String(p&&p.id||""),title:String(p&&p.title||"Income"),amount:Le,grossAmount:Le,netAmount:Number.isFinite(Number(p&&p.netAmount))?b(Number(p&&p.netAmount)):null,vatRate:Number.isFinite(Number(p&&p.vatRate))?Number(p&&p.vatRate):0,vatAmount:Number.isFinite(Number(p&&p.vatAmount))?b(Number(p&&p.vatAmount)):0,dueDate:q(p&&p.expectedDateISO),status:ee,dueState:K(p,ee,Y),probability:be,weightedAmount:b(Le*be),incomeType:String(p&&p.incomeType||"one_off"),projectId:String(p&&p.projectId||""),scope:String(p&&p.scope||"shared")}}).filter(function(p){return p.status!=="paid"&&p.status!=="cancelled"&&p.status!=="lost"}),ue={confirmed:0,invoiced:0,due:0,overdue:0,expected:0,proposal:0,lead:0,risky:0,recurring:0,received:0};A.forEach(function(p){var ee=Date.parse(p.dueDate||"");!Number.isFinite(ee)||ee<_t||ee>tt||(p.status==="confirmed"&&(ue.confirmed+=p.amount),p.status==="invoiced"&&(ue.invoiced+=p.amount),p.status==="due"&&(ue.due+=p.amount),(p.status==="overdue"||p.dueState==="overdue"||p.dueState==="severely_overdue")&&(ue.overdue+=p.amount),p.status==="expected"&&(ue.expected+=p.amount),p.status==="proposal"&&(ue.proposal+=p.amount),p.status==="lead"&&(ue.lead+=p.amount),p.status==="risky"&&(ue.risky+=p.amount),(p.incomeType==="retainer"||p.incomeType==="recurring")&&(ue.recurring+=p.amount))}),Z.forEach(function(p){var ee=Date.parse(p&&p.timestamp||"");!Number.isFinite(ee)||ee<_t||ee>tt||String(p&&p.type)==="income.received"&&(ue.received+=Number(p&&p.amount)||0)});function lt(p){var ee=Date.parse(p&&p.dueDate||"");return Number.isFinite(ee)&&ee>=Y&&ee<=gn}function dt(p,ee){var be=Date.parse(p&&p.dueDate||"");return Number.isFinite(be)?be>=Y&&be<=x(Y,ee).getTime():!1}var Re=A.filter(lt),Ct=Re.filter(function(p){return W(p,"conservative")}).reduce(function(p,ee){return p+(Number(ee.amount)||0)*t.clampProbability(ee.probability)},0),ut=Re.filter(function(p){return W(p,"expected")&&!W(p,"conservative")}).reduce(function(p,ee){return p+(Number(ee.amount)||0)*t.clampProbability(ee.probability)},0),sn=Re.filter(function(p){return W(p,"optimistic")&&!W(p,"expected")}).reduce(function(p,ee){return p+(Number(ee.amount)||0)*t.clampProbability(ee.probability)},0),he=Ze.filter(function(p){return p.status!=="paid"}).reduce(function(p,ee){return p+(Number(ee.amount)||0)},0),We=b(Gt-Kt);function je(p){Be.push(Object.assign({kind:"setup",targetId:"",actionLabel:"Review",tone:"review"},p))}var Be=[];Ze.filter(function(p){return p.status==="overdue"||p.status==="due_soon"||p.status==="needs_review"||p.status==="deferred"}).slice(0,8).forEach(function(p){var ee=String(p.type)==="debt";Be.push({kind:ee?"debt":"obligation",id:p.id,targetId:p.id,title:p.title,reason:ee?"Debt needs a due date or payment plan":p.status==="overdue"?"Overdue obligation":p.status==="due_soon"?"Due within 7 days":"Needs an obligation decision",actionLabel:ee?"Add plan":p.status==="overdue"?"Mark paid":"Review",tone:p.status==="overdue"?"urgent":"review"})}),Z.filter(function(p){return String(p&&p.type)==="expense.recorded"&&!String(p&&p.obligationId||"").trim()&&String(p&&p.categoryId||"").toLowerCase()==="obligation"}).slice(0,4).forEach(function(p){je({kind:"payment",id:String(p&&p.id||""),targetId:String(p&&p.id||""),title:String(p&&p.description||"Payment"),reason:"Actual payment needs matching to an obligation",actionLabel:"Match",tone:"review"})}),Z.filter(function(p){return String(p&&p.categoryId||"").toLowerCase()==="uncategorized"||String(p&&p.reviewStatus||"").toLowerCase()==="needs_review"}).slice(0,4).forEach(function(p){je({kind:"transaction",id:String(p&&p.id||""),targetId:String(p&&p.id||""),title:String(p&&p.description||"Transaction"),reason:"Uncategorized transaction",actionLabel:"Categorize",tone:"review"})}),A.filter(function(p){return p.status==="risky"||p.status==="lead"||p.status==="proposal"||p.dueState==="overdue"||p.dueState==="severely_overdue"}).slice(0,4).forEach(function(p){Be.push({kind:"pipeline",id:p.id,targetId:p.id,title:p.title,reason:p.dueState==="overdue"||p.dueState==="severely_overdue"?"Expected income is overdue":"Income confidence needs review",actionLabel:p.dueState==="overdue"||p.dueState==="severely_overdue"?"Received":"Update",tone:"review"})}),oe.length||Be.unshift({kind:"setup",id:"missing-cash",targetId:"missing-cash",title:"Cash baseline",reason:"Add at least one cash account",actionLabel:"Add account",tone:"urgent"}),de.length||je({kind:"setup",id:"missing-burn",targetId:"missing-burn",title:"Monthly burn",reason:"Add recurring fixed costs",actionLabel:"Add recurring cost",tone:"review"});var Lt=Be.filter(function(p){return["obligation","payment","transaction","pipeline","debt","setup"].indexOf(String(p&&p.kind||""))!==-1}).slice(0,6),Yt=A.filter(function(p){return dt(p,30)}),cn=Ze.filter(function(p){return p.status!=="paid"&&dt(p,30)}),wt=Yt.filter(function(p){return W(p,"conservative")}).reduce(function(p,ee){return p+(Number(ee.amount)||0)*t.clampProbability(ee.probability)},0),St=Yt.filter(function(p){return W(p,"expected")&&!W(p,"conservative")}).reduce(function(p,ee){return p+(Number(ee.amount)||0)*t.clampProbability(ee.probability)},0),ie=cn.reduce(function(p,ee){return p+(Number(ee.amount)||0)},0),me=cn.filter(function(p){return String(p&&p.type||"")!=="debt"}).reduce(function(p,ee){return p+(Number(ee.amount)||0)},0),Ve=on.reduce(function(p,ee){return p+Ae(ee)},0),mt=b(Gt),Qt=b(Kt),mi=b(ie),ln=b(mt-Qt-mi),Di=7,pi=b(nt>0?nt*Di/30:0),it=[];nt<=0&&it.push("Minimum buffer is unavailable until monthly burn is known."),_e.some(function(p){return(Number(p&&p.outstanding)||0)>0&&String(p&&p.planStatus||"missing")==="missing"})&&it.push("Some debt items still need payment plans.");var wn=b(mt-Qt-me-Ve-pi),Ci=b(_e.reduce(function(p,ee){return p+(Number(ee&&ee.outstanding)||0)},0)),Qi={actualCash:le("actualCash","Actual cash",mt,[{label:"Active liquid account balances",value:mt,operation:"add"}]),protectedCash:le("protectedCash","Protected cash",Qt,G.filter(function(p){return Number(p&&p.amount)>0}).map(function(p){return{label:String(p.label||"Reserve bucket"),value:Number(p.amount)||0,operation:"add"}})),availableCash:le("availableCash","Available cash",ln,[{label:"Actual cash",value:mt,operation:"add"},{label:"This money is protected",value:Qt,operation:"subtract"},{label:"Due within 30 days",value:mi,operation:"subtract"}]),safeToSpend:le("safeToSpend","Safe-to-Spend",wn,[{label:"Actual cash",value:mt,operation:"add"},{label:"This money is protected",value:Qt,operation:"subtract"},{label:"Confirmed obligations due within 30 days",value:me,operation:"subtract"},{label:"Debt payments due soon",value:Ve,operation:"subtract"},{label:"Minimum 7-day buffer",value:pi,operation:"subtract"}],it),monthlyBurnRate:le("monthlyBurnRate","Monthly burn rate",nt,[{label:"Recurring costs",value:Dt,operation:"add"},{label:"Debt payment plans",value:yt,operation:"add"}]),runway:le("runway","Runway",Bt>0?b(ln/Bt):0,[{label:"Available cash",value:ln,operation:"divide"},{label:"Monthly burn rate",value:Bt,operation:"divide"}],Bt>0?[]:["Runway is unavailable until monthly burn is known."]),debtPressure:le("debtPressure","Debt pressure",yt,st.length?st.map(function(p){return{label:String(p.name||"Debt payment plan"),value:Ae(p),operation:"add"}}):[{label:"Active debt payment plans",value:0,operation:"add"}],_e.some(function(p){return(Number(p&&p.outstanding)||0)>0&&String(p&&p.planStatus||"missing")==="missing"})?["Some debt items still need payment plans."]:[]),debtBurden:le("debtBurden","Debt burden",Ci,_e.filter(function(p){return(Number(p&&p.outstanding)||0)>0}).map(function(p){return{label:String(p.name||"Debt"),value:Number(p.outstanding)||0,operation:"add"}}))};return{actualCash:mt,totalCash:mt,protectedCash:Qt,reservedCash:Qt,trulyAvailableCash:We,availableCash:ln,safeToSpend:wn,committedShortTermObligations:mi,confirmedShortTermObligations:b(me),debtPaymentsDueSoon:b(Ve),minimumBuffer:pi,minimumBufferDays:Di,shortTermObligationWindowDays:30,reserveBuckets:G,monthlyPersonalBurn:b(Fe),monthlyBusinessBurn:b(j),totalMonthlyBurn:b(nt),runwayMonths:Bt>0?b(ln/Bt):null,explanations:Qi,obligations:Ze,overdueObligations:Ze.filter(function(p){return p.status==="overdue"}),dueSoonObligations:Ze.filter(function(p){return p.status==="due_soon"}),upcomingObligations:Ze.filter(function(p){return p.status==="upcoming"}),paidObligations:Ze.filter(function(p){return p.status==="paid"}),income:A,incomeThisMonth:{confirmed:b(ue.confirmed),invoiced:b(ue.invoiced),due:b(ue.due),overdue:b(ue.overdue),expected:b(ue.expected),proposal:b(ue.proposal),lead:b(ue.lead),risky:b(ue.risky),recurring:b(ue.recurring),received:b(ue.received)},incomeScenarios:{conservative:b(ln+Ct-he),expected:b(ln+Ct+ut-he),optimistic:b(ln+Ct+ut+sn-he)},dashboardSummary:{actionThisWeek:{count:Be.length,urgentCount:Be.filter(function(p){return p&&p.tone==="urgent"}).length,items:Lt},next30Days:{confirmedIncoming:b(wt),expectedWeightedIncoming:b(St),obligationsDue:b(ie),projectedNetMovement:b(wt+St-ie),incomeCount:Yt.length,obligationCount:cn.length}},reviewQueue:Be.slice(0,10),debtRemaining:b(_e.reduce(function(p,ee){return p+(Number(ee&&ee.outstanding)||0)},0)),reserveGaps:G.filter(function(p){return _.indexOf(p.bucket)!==-1&&Number(p.amount)<=0})}}function Q(U,V){var R=c(V),Y=t.sortFinancialEvents(u(U)),oe=n.getActiveEvents(Y),de=n.buildReadModel(Y,R),xe=R.nowIso||new Date().toISOString(),Z=Date.parse(xe),Rt=new Date(Z);Rt.setDate(Rt.getDate()+R.forecastDays);var Wt=Rt.getTime(),_e=0,et=0,st=0,Ot=!1,on=0,Nt=t.localDateKey(xe);oe.forEach(function(ie){var me=Date.parse(ie.timestamp),Ve=t.toMinor(Math.abs(Number(ie.amount)||0)),mt=Number.isFinite(me)?me<=Z:!1,Qt=Number.isFinite(me)?me>Z&&me<=Wt:!1;if(ie.type==="income.received"){mt?_e+=t.toMinor(Number(ie.amount)||0):Qt&&(on+=t.toMinor(Number(ie.amount)||0)),mt&&Nt&&t.localDateKey(ie.timestamp)===Nt&&(et+=t.toMinor(Number(ie.amount)||0));return}if(ie.type==="expense.recorded"){Ot=!0,mt&&(_e-=Ve),m(ie.timestamp,Z,30)&&(st+=Ve);return}ie.type!=="debt.added"&&ie.type!=="debt.payment_made"&&ie.type==="balance.opening_set"&&mt&&(_e+=t.toMinor(Number(ie.amount)||0))});var _t=u(de.fiatAccounts),tt=u(de.web3Positions),gn=u(de.defiPositions),He=t.toMinor(_t.reduce(function(ie,me){return ie+(Number(me&&me.balance)||0)},0)),Gt=t.toMinor(tt.reduce(function(ie,me){return ie+(Number(me&&me.amount)||0)*(Number(me&&me.price)||0)},0)),Kt=t.toMinor(gn.reduce(function(ie,me){return ie+((Number(me&&me.collateralValue)||0)-(Number(me&&me.debtValue)||0))},0)),G=He+Gt+Kt,Fe=_t.length>0||tt.length>0||gn.length>0,j=_t.length>0?He:Fe?G:_e,Dt=0,yt=0,jt=Ne(de.transactions);u(de.pipelineDeals).forEach(function(ie){if(y(ie.status)&&jt[String(ie&&ie.id||"")]!==!0){var me=t.clampProbability(ie.probability),Ve=t.toMinor(h(ie.value,0)*me);Dt+=Ve,f(ie.expectedDateISO,Z,Wt)&&(yt+=Ve)}});var nt=t.toMinor(de.recurringMonthlyTotal||0),Bt=t.toMinor(u(de.activeRecurringExpenses).filter(function(ie){return ie.essential}).reduce(function(ie,me){return ie+(Number(me.monthlyAmount)||0)},0)),Ze=Bt,ve=nt,ct=null;(de.recurringExpenses||[]).length>0?ct=nt:st>0?ct=st:Ot&&(ct=0);var I=nt>0?Math.round(nt*(R.forecastDays/30)):0,d=j+yt+on-I,A=t.toMinor(de.debtTotal||0),ue=t.toMinor(u(de.reserveBuckets).reduce(function(ie,me){return ie+(Number(me.currentAmount)||0)},0)),lt=Math.max(0,j-ue),dt=ct==null?null:t.fromMinor(ct),Re=t.fromMinor(Ze),Ct=t.fromMinor(ve),ut=null;ct!=null&&ct>0&&(ut=b(t.fromMinor(lt)/t.fromMinor(ct)));var sn=dt,he=F(de,{},R,Z),We=[];u(de.transactions).forEach(function(ie){(ie.reviewStatus==="needs_review"||ie.categoryId==="uncategorized")&&We.push({type:"Needs review",title:ie.description,amount:ie.amount,action:"Review",id:ie.id,original:ie})}),u(de.invoices).forEach(function(ie){if(ie.status!=="Paid"&&ie.expectedDate){var me=Date.parse(ie.expectedDate);Number.isFinite(me)&&me<Z&&We.push({type:"Overdue",title:ie.client+" invoice",amount:ie.amount,action:"Mark paid",id:ie.id,original:ie})}}),u(he.upcomingObligations).concat(u(he.overdueObligations)).forEach(function(ie){We.push({type:"Due soon",title:ie.title,amount:ie.amount,action:"Review",id:ie.id,original:ie})}),u(de.debtAccounts).forEach(function(ie){ie.outstanding>0&&String(ie.planStatus||"missing")==="missing"&&We.push({type:"Missing plan",title:ie.name,amount:ie.outstanding,action:"Add plan",id:ie.id,original:ie})}),u(de.pipelineDeals).filter(function(ie){return n.isPipelineActive(ie.status)}).length===0&&We.push({type:"Missing forecast input",title:"Income pipeline",amount:null,action:"Add income",id:"pipeline-missing"}),u(de.reserveBuckets).length===0&&We.push({type:"Missing plan",title:"Reserve buckets",amount:null,action:"Create reserve",id:"reserves-missing"});var je={realBalance:t.fromMinor(j),projectedBalance:t.fromMinor(d),attentionQueue:We,trulyAvailable:t.fromMinor(lt),reserveTotal:t.fromMinor(ue),survivalBurn:Re,comfortBurn:Ct,weightedPipeline:t.fromMinor(Dt),monthlyBurn:dt,runwayMonths:ut,breakEvenRevenue:sn,revenueToday:t.fromMinor(et),totalDebt:t.fromMinor(A),confidenceScore:1,missingInputs:[],lastComputedAt:xe,totalCash:he.totalCash,actualCash:he.actualCash,reservedCash:he.reservedCash,protectedCash:he.protectedCash,trulyAvailableCash:he.trulyAvailableCash,availableCash:he.availableCash,safeToSpend:he.safeToSpend,committedShortTermObligations:he.committedShortTermObligations,confirmedShortTermObligations:he.confirmedShortTermObligations,debtPaymentsDueSoon:he.debtPaymentsDueSoon,minimumBuffer:he.minimumBuffer,minimumBufferDays:he.minimumBufferDays,monthlyPersonalBurn:he.monthlyPersonalBurn,monthlyBusinessBurn:he.monthlyBusinessBurn,totalMonthlyBurn:he.totalMonthlyBurn,availableRunwayMonths:he.runwayMonths,confirmedIncomeThisMonth:he.incomeThisMonth.confirmed,expectedIncomeThisMonth:he.incomeThisMonth.expected,riskyIncomeThisMonth:he.incomeThisMonth.risky,debtRemaining:he.debtRemaining};he.totalMonthlyBurn>0&&(je.monthlyBurn=he.totalMonthlyBurn,je.runwayMonths=he.runwayMonths,je.breakEvenRevenue=he.totalMonthlyBurn);var Be=[];(de.recurringExpenses||[]).length===0&&Be.push("recurring expenses"),(oe.length===0||!oe.some(function(ie){return m(ie.timestamp,Z,30)}))&&Be.push("recent financial activity"),je.monthlyBurn==null&&Be.push("monthly burn"),(de.pipelineDeals||[]).filter(function(ie){return y(ie.status)}).length===0&&Be.push("pipeline");var Lt=oe.length?Date.parse(oe[oe.length-1].timestamp):0,Yt=Lt>0?Z-Lt>1080*60*60*1e3:!0,cn={realBalanceFromSums:t.fromMinor(j),weightedPipelineFromDeals:t.fromMinor(Dt),totalDebtFromLiabilities:t.fromMinor(A)},wt=r.evaluateFinancialInvariants({snapshot:je,components:cn}),St=o.computeConfidenceScore({missingRecurringExpenses:(de.recurringExpenses||[]).length===0,noRecentData:Be.indexOf("recent financial activity")!==-1,undefinedBurn:je.monthlyBurn==null,emptyPipeline:Be.indexOf("pipeline")!==-1,staleCompute:Yt,missingInputs:Be.concat(wt.messages||[]),invariantViolations:wt.violations});return je.confidenceScore=St.score,je.missingInputs=St.missingInputs,wt.violations.length>0&&e.console&&typeof e.console.warn=="function"&&e.console.warn("[FinanceInvariant] violation(s)",wt.violations),{snapshot:je,readModel:de,treasury:he,explanations:Object.assign({},he.explanations,{forecastConfidence:le("forecastConfidence","Forecast confidence",Math.round((Number(St.score)||0)*100),[{label:"Confidence score",value:Math.round((Number(St.score)||0)*100),operation:"add"}],St.reasons||St.missingInputs||[])}),invariants:wt,confidence:St,diagnostics:{staleCompute:Yt,latestEventTimestamp:Lt?new Date(Lt).toISOString():null,forecastDays:R.forecastDays,baseCurrency:R.baseCurrency,invariantMessages:wt.messages||[],forecastFutureIncome:t.fromMinor(on),realBalanceFromEvents:t.fromMinor(_e),realBalanceFromFiatAccounts:t.fromMinor(He),realBalanceFromAssets:t.fromMinor(G),realBalanceUsesFiatAnchor:_t.length>0,realBalanceUsesAssetAnchor:Fe}}}function X(U,V){return Q(U,V).snapshot}var O={normalizeSettings:c,computeFinancialContext:Q,computeFinancialState:X};typeof module<"u"&&module.exports&&(module.exports=O),e.FinanceCompute=O})(typeof window<"u"?window:globalThis);function gr(e,t="EUR"){const n=String(e||"").trim().toUpperCase();return n||String(t||"").trim().toUpperCase()||"EUR"}function hs(e,t={}){const n=Number(e);if(!Number.isFinite(n))return"—";const r=gr(t.currency,t.baseCurrency);return new Intl.NumberFormat(t.locale,{style:"currency",currency:r,minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,r=e.FinanceCompute;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!r&&typeof module<"u"&&module.exports&&(r=require("./compute.js")),!t||!n||!r)throw new Error("Finance modal event utilities require events/ledger/compute modules.");function o(x){if(!t.isIsoTimestamp(x))throw new Error("Timestamp is required and must be ISO-8601.");return new Date(x).toISOString()}function c(x){var q=Number(x);if(!Number.isFinite(q))throw new Error("Amount must be a finite number.");return q}function u(x){var q=Number(x);return Number.isFinite(q)&&q>=0&&q<=1}function m(x){if(!u(x))throw new Error("Probability must be in range 0..1.");return Number(x)}function f(x){return n.normalizeSettings(x||{})}function y(x,q){var H=x&&typeof x=="object"?x:{},fe=f(q),J=Math.abs(c(H.amount)),K=o(H.timestamp),W=m(H.probability),re=String(H.id||H.related_entity_id||"pipe-"+Date.now()),le=String(H.status||"open").trim().toLowerCase()||"open";return{type:"pipeline.created",amount:J,currency:t.normalizeCurrency(H.currency,fe.baseCurrency),timestamp:K,related_entity_id:re,metadata:{title:String(H.title||"Pipeline Item"),value:J,probability:W,status:le,stage:le,expectedDateISO:String(H.expectedDateISO||K.slice(0,10))}}}function h(x,q){var H=x&&typeof x=="object"?x:{},fe=f(q),J=Math.abs(c(H.monthlyAmount!=null?H.monthlyAmount:H.amount));return{type:"expense.recurring_set",amount:J,currency:t.normalizeCurrency(H.currency,fe.baseCurrency),timestamp:o(H.timestamp),related_entity_id:String(H.id||H.related_entity_id||"expense-"+Date.now()),metadata:{category:String(H.category||"Recurring Expense"),monthlyAmount:J,essential:!!H.essential,active:H.active!==!1}}}function b(x,q){var H=x&&typeof x=="object"?x:{},fe=f(q),J=c(H.amount),K=H.type;if(K||(K=J>=0?"income.received":"expense.recorded"),K!=="income.received"&&K!=="expense.recorded")throw new Error("Unsupported transaction draft type: "+K);return{type:K,amount:Math.abs(J),currency:t.normalizeCurrency(H.currency,fe.baseCurrency),timestamp:o(H.timestamp),related_entity_id:H.related_entity_id?String(H.related_entity_id):void 0,metadata:H.metadata&&typeof H.metadata=="object"?t.deepClone(H.metadata):{}}}function _(x,q,H){var fe=f(H),J=t.isIsoTimestamp(fe.nowIso)?fe.nowIso:new Date().toISOString(),K=n.appendEvents(x||[],q||[],fe,{nowIso:J,allowApproximateTimestamp:!1});return{snapshot:r.computeFinancialState(K.events,{baseCurrency:fe.baseCurrency,forecastDays:fe.forecastDays,nowIso:J}),events:K.events,appended:K.appended}}function B(x){return Array.isArray(x)?x.slice():[]}var N={requireTimestamp:o,requireAmount:c,validateProbability:u,requireProbability:m,buildPipelineCreateDraft:y,buildRecurringExpenseDraft:h,buildIncomeOrExpenseDraft:b,previewSnapshot:_,cancelWithoutMutation:B};typeof module<"u"&&module.exports&&(module.exports=N),e.FinanceModalEvents=N})(typeof window<"u"?window:globalThis);(function(e){var t=e.FinanceEvents,n=e.FinanceLedger,r=e.FinanceCompute,o=e.FinanceModalEvents;if(!t&&typeof module<"u"&&module.exports&&(t=require("./events.js")),!n&&typeof module<"u"&&module.exports&&(n=require("./ledger.js")),!r&&typeof module<"u"&&module.exports&&(r=require("./compute.js")),!o&&typeof module<"u"&&module.exports&&(o=require("./modal-events.js")),!t||!n||!r)throw new Error("FinanceCommandService dependencies are missing.");function c(b){return n.normalizeSettings(b||{})}function u(b){return Array.isArray(b)?b:[]}function m(b,_,B){if(!b||typeof b.getFinanceLedger!="function"||typeof b.getFinanceSettings!="function")return null;var N=u(_).filter(Boolean);if(!N.length)return null;var x=b.getFinanceSettings()||{},q=c({baseCurrency:B&&B.baseCurrency||x.baseCurrency,forecastDays:B&&B.forecastDays||x.forecastDays,nowIso:B&&B.nowIso||new Date().toISOString()}),H=b.getFinanceLedger();if(o&&typeof o.previewSnapshot=="function")return o.previewSnapshot(H,N,q).snapshot;var fe=n.appendEvents(H,N,q,{nowIso:q.nowIso,allowApproximateTimestamp:!1});return r.computeFinancialState(fe.events,q)}function f(b,_,B){if(!b||typeof b.appendFinanceEvents!="function")throw new Error("Store.appendFinanceEvents is unavailable.");var N=u(_).filter(Boolean);if(!N.length)return[];var x=B||{};return b.appendFinanceEvents(N,{source:x.source||"finance.command"})}function y(b){return!b||typeof b.getFinanceLedger!="function"||!n||typeof n.getActiveEvents!="function"?[]:n.getActiveEvents(b.getFinanceLedger())}var h={normalizeSettings:c,previewFromDrafts:m,appendDrafts:f,getActiveEvents:y};e.FinanceCommandService=h})(typeof window<"u"?window:globalThis);window.FinancialEngine=(function(){const e={LOW:"Low",MEDIUM:"Medium",HIGH:"High"};function t(N,x){const q=Number(N);return Number.isFinite(q)?q:Number.isFinite(Number(x))?Number(x):0}function n(N,x,q){const H=t(N,x);return Math.min(q,Math.max(x,H))}function r(N){const x=N&&typeof N=="object"?N:{},q=x.monthlyBurn==null?null:t(x.monthlyBurn,0),H=x.runwayMonths==null?null:t(x.runwayMonths,null);return{realBalance:t(x.realBalance,0),projectedBalance:t(x.projectedBalance,0),weightedPipeline:t(x.weightedPipeline,0),monthlyBurn:q,runwayMonths:H,breakEvenRevenue:x.breakEvenRevenue==null?q:t(x.breakEvenRevenue,q),revenueToday:t(x.revenueToday,0),totalDebt:t(x.totalDebt,0),confidenceScore:Math.max(0,Math.min(1,t(x.confidenceScore,0))),missingInputs:Array.isArray(x.missingInputs)?x.missingInputs.slice():[],lastComputedAt:x.lastComputedAt||new Date().toISOString()}}function o(){return{pipelineDeals:[],recurringExpenses:[],debtAccounts:[],invoices:[],fiatAccounts:[],web3Positions:[],defiPositions:[],expectedPipeline90d:0}}function c(){return!window.Store||typeof window.Store.getFinancialSnapshot!="function"?null:r(window.Store.getFinancialSnapshot())}function u(){if(!window.Store||typeof window.Store.getFinancialReadModel!="function")return o();const N=window.Store.getFinancialReadModel();return N&&typeof N=="object"?N:o()}function m(N){const x=N&&typeof N=="object"?N:{},q=Array.isArray(x.expenses)?x.expenses:[],H=Array.isArray(x.debt)?x.debt:[],fe=Array.isArray(x.income)?x.income:[],J=Array.isArray(x.fiatAccounts)?x.fiatAccounts:[],K=Array.isArray(x.savings)?x.savings:[],W=q.reduce((Q,X)=>Q+t(X&&X.monthlyAmount,0),0),re=H.reduce((Q,X)=>Q+t(X&&(X.monthlyPayment??X.minimumPaymentMonthly),0),0),le=W+re,Ne=J.reduce((Q,X)=>Q+t(X&&X.balance,0),0)+K.reduce((Q,X)=>Q+t(X&&X.amount,0),0),Ae=fe.filter(Q=>String(Q&&Q.status||"").toLowerCase()!=="paid").reduce((Q,X)=>Q+t(X&&X.amount,0)*t(X&&X.probability,0),0),C=H.reduce((Q,X)=>Q+t(X&&X.total,0),0),F=le>0?Ne/le:null;return{realBalance:Ne,projectedBalance:Ne+Ae,weightedPipeline:Ae,monthlyBurn:le,runwayMonths:F,breakEvenRevenue:le,revenueToday:0,totalDebt:C,confidenceScore:.4,missingInputs:["legacy finance model"],lastComputedAt:new Date().toISOString()}}function f(N){if(N&&typeof N=="object"&&N.financeSnapshot)return{snapshot:r(N.financeSnapshot),readModel:N.financeReadModel&&typeof N.financeReadModel=="object"?N.financeReadModel:o()};if(N&&typeof N=="object"&&N.realBalance!=null&&N.weightedPipeline!=null)return{snapshot:r(N),readModel:o()};const x=c();return x?{snapshot:x,readModel:u()}:{snapshot:r(m(N)),readModel:o()}}function y(N){const x=(Array.isArray(N.fiatAccounts)?N.fiatAccounts:[]).reduce((J,K)=>J+t(K&&K.balance,0),0);let q=0,H=0,fe=0;return(Array.isArray(N.web3Positions)?N.web3Positions:[]).forEach(J=>{const K=t(J&&J.amount,0)*t(J&&J.price,0),W=String(J&&J.liquidity||"").toLowerCase();W==="low"?H+=K:W==="med"||W==="medium"?q+=K:fe+=K}),{safe:x+fe,growth:q,speculative:H}}function h(N){const x=f(N),q=x.snapshot,H=x.readModel||o(),fe=y(H),J=q.runwayMonths;let K=e.LOW;J==null||J<4?K=e.HIGH:J<6&&(K=e.MEDIUM);const W=J==null?0:Math.min(100,Math.max(0,J/12*100)),re=Math.round(q.confidenceScore*100),le=q.totalDebt>Math.max(1,q.realBalance)?18:0,Ne=Math.max(0,Math.min(100,Math.round(W*.6+re*.4-le))),Ae=q.monthlyBurn==null?0:q.monthlyBurn,C=t(H.expectedPipeline90d,q.weightedPipeline),F=Date.parse(String(N&&N.nowIso||""))||Date.now(),Q=F+2160*60*60*1e3,X=(Array.isArray(H.invoices)?H.invoices:[]).filter(oe=>String(oe&&oe.status||"").toLowerCase()==="paid").filter(oe=>{const de=Date.parse(String(oe&&oe.paidAt||oe&&oe.sentAt||oe&&oe.expectedDateISO||oe&&oe.timestamp||""));return Number.isFinite(de)&&de>=F&&de<=Q}).reduce((oe,de)=>oe+t(de&&de.amount,0),0),O=q.realBalance,U=q.projectedBalance,V=q.totalDebt,R=fe.growth+fe.speculative;return{fiatTotal:fe.safe,savingsTotal:0,debtTotalRemaining:V,web3Total:R,totalNetWorth:U,liquidNetWorth:O,monthlyBurn:Ae,survivalBurn:Ae,runwayMonths:q.runwayMonths,survivalRunwayMonths:q.runwayMonths,confirmedIncome90d:X,weightedIncome90d:C,stressLevel:K,safetyScore:Ne,allocation:fe,confidenceScore:q.confidenceScore,missingInputs:q.missingInputs,computedAt:q.lastComputedAt}}function b(N,x={}){const q=f(N),H=h(N),fe=q.readModel||o(),J=12,K={safe:[],realistic:[],optimistic:[]},W=Array.isArray(fe.pipelineDeals)?fe.pipelineDeals:[];let re=t(q.snapshot.realBalance,0),le=t(q.snapshot.realBalance,0),Ne=t(q.snapshot.realBalance,0);const Ae=n(t(x.probFloor,50)/100,0,1),C=n(t(x.marketShift,0),-1,1);for(let F=0;F<J;F++){const Q=new Date;Q.setMonth(Q.getMonth()+F);const X=new Date(Q.getFullYear(),Q.getMonth(),1),O=new Date(Q.getFullYear(),Q.getMonth()+1,0),U=W.filter(xe=>{const Z=new Date(xe.expectedDateISO||"");return Z>=X&&Z<=O}),V=xe=>n(Math.max(t(xe,0),Ae)*(1+C),0,1),R=U.filter(xe=>String(xe.status||"").toLowerCase()==="signed"||String(xe.status||"").toLowerCase()==="paid").reduce((xe,Z)=>xe+t(Z.value,0),0),Y=U.reduce((xe,Z)=>xe+t(Z.value,0)*V(Z.probability),0),oe=U.reduce((xe,Z)=>xe+t(Z.value,0)*n(V(Z.probability)+.2,0,1),0),de=t(H.monthlyBurn,0)*(1+(x.burnChange||0));re=re+R-de,le=le+Y-de,Ne=Ne+oe-de,K.safe.push(Math.max(0,re)),K.realistic.push(Math.max(0,le)),K.optimistic.push(Math.max(0,Ne))}return K}function _(N){if(!N)return null;const x=N.runwayMonths;return{RUNWAY_STATUS:x==null?"unknown":x>=6?"safe":x>=4?"thin":"critical",STRESS_LEVEL:String(N.stressLevel||e.HIGH).toLowerCase(),STABILITY_SCORE:t(N.safetyScore,0),URGENCY_FLAG:x==null||x<4,CONFIDENCE_SCORE:t(N.confidenceScore,0),MISSING_INPUTS:Array.isArray(N.missingInputs)?N.missingInputs.slice():[]}}function B(){if(!window.Store||typeof window.Store.getFinancialSnapshot!="function")return null;const N=h({financeSnapshot:window.Store.getFinancialSnapshot(),financeReadModel:typeof window.Store.getFinancialReadModel=="function"?window.Store.getFinancialReadModel():o()});return _(N)}return{compute:h,generateProjections:b,getSignals:_,getSignalsFromStore:B,STRESS_LEVELS:e}})();function bs(e,t=12){const n=new Date;return n.setDate(n.getDate()+e),n.setHours(t,0,0,0),n.toISOString()}function Ga(e){const t=new Date;return t.setUTCDate(t.getUTCDate()+e),`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,"0")}-${String(t.getUTCDate()).padStart(2,"0")}`}function ys(e){const t=n=>bs(n);return[{type:"asset.account_set",amount:10400,currency:e,timestamp:t(-28),related_entity_id:"cash-operating",metadata:{name:"Operating cash",balance:10400,active:!0,scope:"business",bucket:"available"}},{type:"asset.account_set",amount:6200,currency:e,timestamp:t(-27),related_entity_id:"reserve-tax",metadata:{name:"Tax reserve",balance:6200,active:!0,scope:"business",bucket:"tax_reserve",reserved:!0}},{type:"asset.account_set",amount:2800,currency:e,timestamp:t(-26),related_entity_id:"reserve-vat",metadata:{name:"VAT reserve",balance:2800,active:!0,scope:"business",bucket:"vat_reserve",reserved:!0}},{type:"asset.account_set",amount:1800,currency:e,timestamp:t(-25),related_entity_id:"reserve-health",metadata:{name:"Health insurance reserve",balance:1800,active:!0,scope:"personal",bucket:"health_insurance",reserved:!0}},{type:"asset.account_set",amount:3e3,currency:e,timestamp:t(-24),related_entity_id:"reserve-buffer",metadata:{name:"Studio buffer",balance:3e3,active:!0,scope:"shared",bucket:"buffer",reserved:!0}},...[["Housing",1450,!0],["Studio & tools",420,!0],["Living",1120,!0],["Subscriptions",260,!1],["Flexible buffer",450,!1]].map(([n,r,o],c)=>({type:"expense.recurring_set",amount:Number(r),currency:e,timestamp:t(-16+c),related_entity_id:`expense-${c+1}`,metadata:{category:n,monthlyAmount:r,essential:o,active:!0,dueDay:1+c*4,frequency:"monthly",scope:c<2?"business":"personal"}})),{type:"debt.added",amount:6400,currency:e,timestamp:t(-90),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},{type:"debt.payment_made",amount:1e3,currency:e,timestamp:t(-15),related_entity_id:"debt-credit-line",metadata:{name:"Credit line",scope:"business"}},...[["Editorial system",2600,-72],["Advisory sprint",1750,-39],["Research direction",3200,-13]].flatMap(([n,r,o],c)=>{const u=`settled-${c+1}`,m=t(Number(o));return[{type:"invoice.paid",amount:Number(r),currency:e,timestamp:m,related_entity_id:u,metadata:{client:n,amount:r,expectedDate:Ga(Number(o)),destinationAccountId:"cash-operating",scope:"business"}},{type:"income.received",amount:Number(r),currency:e,timestamp:m,related_entity_id:u,metadata:{description:`Invoice paid: ${n}`,invoiceId:u,accountId:"cash-operating",accountName:"Operating Cash",categoryId:"client-income",scope:"business",source:"demo"}}]}),...[["Product strategy retainer",4200,.9,18,"confirmed"],["Design systems advisory",2900,.65,37,"expected"],["Research collaboration",5600,.35,64,"risky"]].map(([n,r,o,c,u],m)=>({type:"pipeline.created",amount:Number(r),currency:e,timestamp:t(-6+m),related_entity_id:`pipeline-${m+1}`,metadata:{title:n,value:r,probability:o,status:u,stage:u,expectedDateISO:Ga(Number(c)),destinationAccountId:"cash-operating",destinationAccountName:"Operating Cash",scope:"business"}})),{type:"expense.recorded",amount:180,currency:e,timestamp:t(-5),related_entity_id:"transaction-research-tools",metadata:{description:"Research tools",accountId:"cash-operating",accountName:"Operating Cash",categoryId:"tools",scope:"business",source:"demo"}}]}const ae=Object.freeze({ledger:"finance-master.ledger.v1",settings:"finance-master.settings.v1",ui:"finance-master.ui.v1",review:"finance-master.review.v1",goals:"finance-master.goals.v1",imports:"finance-master.imports.v1",scenarios:"finance-master.scenarios.v1",priceCache:"finance-master.prices.v1",backupMeta:"finance-master.backup-meta.v1",focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",collapsedPrefix:"finance-master.layout.collapsed.",heroDetails:"finance-master.layout.hero-details",demoSeed:"finance-master.demo-seeded.v1"}),Ka=Object.freeze(Object.values(ae)),wa="Finance Master",Sa=2,ws=[1,2],pn="finance-master.local-first.v1";function vr(e){try{return JSON.parse(e)}catch{return e}}function Ss(e,t){return e!==void 0?{source:"indexeddb",value:e,removeLegacy:!1}:t==null?{source:"empty",value:void 0,removeLegacy:!1}:{source:"localStorage",value:vr(t),removeLegacy:!0}}const $s="finance-master",Is=1,Fn="state",Ii=new Map;let qn=null;function Gi(e){return JSON.parse(JSON.stringify(e))}function As(e){return typeof e=="string"?e:JSON.stringify(e)}function Ms(e){try{return window.localStorage.getItem(e)}catch{return null}}function hr(e,t){try{window.localStorage.setItem(e,As(t))}catch{}}function Ns(e){try{window.localStorage.removeItem(e)}catch{}}function ka(e){return new Promise((t,n)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>n(e.error)})}function Ds(){return"indexedDB"in window?new Promise(e=>{const t=indexedDB.open($s,Is);t.onupgradeneeded=()=>{t.result.objectStoreNames.contains(Fn)||t.result.createObjectStore(Fn)},t.onsuccess=()=>e(t.result),t.onerror=()=>e(null)}):Promise.resolve(null)}async function Cs(e){if(!qn)return;const t=qn.transaction(Fn,"readonly");return ka(t.objectStore(Fn).get(e))}async function br(e,t){if(hr(e,t),!qn)return;const n=qn.transaction(Fn,"readwrite");await ka(n.objectStore(Fn).put(Gi(t),e))}async function xs(e){if(Ns(e),!qn)return;const t=qn.transaction(Fn,"readwrite");await ka(t.objectStore(Fn).delete(e))}async function ks(e){qn=await Ds(),await Promise.all(e.map(async t=>{const n=await Cs(t),r=Ms(t),o=t==="finance-master.scenarios.v1"&&r!=null?{source:"localStorage",value:vr(r)}:Ss(n,r);if(o.source!=="empty"){if(Ii.set(t,Gi(o.value)),o.source==="indexeddb"){hr(t,o.value);return}await br(t,o.value)}}))}function Vi(e,t){return Gi(Ii.has(e)?Ii.get(e):t)}function ri(e,t){Ii.set(e,Gi(t)),br(e,t)}function Oi(e){Ii.delete(e),xs(e)}function It(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Fs(e){return typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function ci(e){return String(e||"").trim()}function Fa(e){return It(e?.metadata)?e.metadata:{}}function Ht(e,t,n,r="error"){return{key:e,label:t,message:n,severity:r}}function _i(e,t,n,r,o=n){if(!Array.isArray(r))return;const c=new Set;r.forEach((u,m)=>{const f=ci(u&&u.id);f&&(c.has(f)&&e.push(Ht(t,n,`${o} item ${m+1} repeats ID "${f}".`)),c.add(f))})}function Ts(e){const t=Fa(e);return ci(e?.related_entity_id||t.entity_id||t.id||e?.id)}function bi(e,t){const n=new Set;return e.forEach(r=>{if(!It(r)||!t(r))return;const o=Ts(r);o&&n.add(o)}),n}function Jt(e,t,n,r,o,c){const u=Fa(t),m=ci(u[r]);!m||!o.size||o.has(m)||e.push(Ht("ledger","Orphaned links",`Ledger event ${n+1} links ${c} "${m}", but no matching record exists.`))}function yr(e={}){const t=e.indexedDbAvailable===!0,n=e.localStorageAvailable===!0,r=e.quotaAvailable===!0,o=Number.isFinite(Number(e.quotaUsage))?Number(e.quotaUsage):null,c=Number.isFinite(Number(e.quotaLimit))?Number(e.quotaLimit):null,u=t!==!0||n!==!0||r!==!0;return{storageStatus:!t&&!n?"unavailable":u?"limited":"healthy",indexedDbAvailable:t,localStorageAvailable:n,quotaAvailable:r,quotaUsage:o,quotaLimit:c,privateModeWarning:u}}async function Es(e=globalThis){var t=!1;try{var n=e&&e.localStorage;if(n){var r="finance-master.storage-check";n.setItem(r,"ok"),n.removeItem(r),t=!0}}catch{t=!1}var o=!1,c=null,u=null;try{var m=await e?.navigator?.storage?.estimate?.();m&&Number.isFinite(Number(m.quota))&&(o=!0,c=Number.isFinite(Number(m.usage))?Number(m.usage):0,u=Number(m.quota))}catch{o=!1}return yr({indexedDbAvailable:!!(e&&"indexedDB"in e),localStorageAvailable:t,quotaAvailable:o,quotaUsage:c,quotaLimit:u})}function Ta(e){if(!Array.isArray(e))return null;const t=e.reduce((n,r)=>{const o=Date.parse(String(r?.timestamp||r?.created_at||""));return Number.isFinite(o)?Math.max(n,o):n},0);return t>0?new Date(t).toISOString():null}function wr(e,t,n){const r=Array.isArray(e?.ledger)?e.ledger:[];return{appName:n,schemaLabel:t,backupVersion:e?.version,exportedAt:e?.exportedAt,eventCount:r.length,latestLocalEventAt:Ta(r)}}function Ps(e){const t=[],n=e.ledger;if(n.present&&!Array.isArray(n.value)&&t.push(Ht("ledger","Ledger events","Stored ledger data is not a list of finance events.")),Array.isArray(n.value)){const c=new Set,u=bi(n.value,h=>String(h.type||"")==="asset.account_set"),m=bi(n.value,h=>String(h.type||"")==="asset.reserve_set"),f=bi(n.value,h=>String(h.type||"").startsWith("debt.")),y=bi(n.value,h=>String(h.type||"").startsWith("invoice.")||String(h.type||"").startsWith("pipeline."));n.value.forEach((h,b)=>{if(!It(h)||!String(h.id||"").trim()||!String(h.type||"").trim()||!Number.isFinite(Number(h.amount))||!Fs(h.timestamp)){t.push(Ht("ledger","Ledger events",`Ledger event ${b+1} is incomplete.`));return}const _=ci(h.id);c.has(_)&&t.push(Ht("ledger","Duplicate IDs",`Ledger event ${b+1} repeats ID "${_}".`)),c.add(_)}),n.value.forEach((h,b)=>{if(!It(h))return;const _=Fa(h),B=ci(_.reversed_event_id||_.reversalOf);B&&!c.has(B)&&t.push(Ht("ledger","Orphaned links",`Ledger event ${b+1} reverses missing event "${B}".`)),Jt(t,h,b,"accountId",u,"cash account"),Jt(t,h,b,"fromAccountId",u,"source account"),Jt(t,h,b,"toAccountId",u,"destination account"),Jt(t,h,b,"linkedCashAccountId",u,"cash account"),Jt(t,h,b,"reserveBucketId",m,"reserve bucket"),Jt(t,h,b,"linkedReserveId",m,"reserve bucket"),Jt(t,h,b,"debtId",f,"debt plan"),Jt(t,h,b,"linkedDebtId",f,"debt plan"),Jt(t,h,b,"invoiceId",y,"income item"),Jt(t,h,b,"pipelineId",y,"income item"),Jt(t,h,b,"linkedIncomeId",y,"income item")})}if([["settings","Finance settings"],["ui","UI settings"],["review","Review state"],["goals","Goals"],["imports","CSV import history"],["scenarios","Saved scenarios"],["priceCache","Cached prices"]].forEach(([c,u])=>{e[c]?.present&&!It(e[c].value)&&t.push(Ht(c,u,`${u} is stored in an unreadable shape.`))}),e.imports?.present&&It(e.imports.value)&&!Array.isArray(e.imports.value.batches)&&t.push(Ht("imports","CSV import history","CSV import history is missing its batch list.")),e.goals?.present&&It(e.goals.value)&&!Array.isArray(e.goals.value.goals)&&t.push(Ht("goals","Goals","Goals data is missing its goal list.")),e.goals?.present&&It(e.goals.value)&&Array.isArray(e.goals.value.goals)){const c=Array.isArray(n.value)?bi(n.value,u=>String(u.type||"")==="asset.account_set"):new Set;_i(t,"goals","Duplicate IDs",e.goals.value.goals,"Goal"),e.goals.value.goals.forEach((u,m)=>{!It(u)||!Array.isArray(u.linkedAccountIds)||!c.size||u.linkedAccountIds.map(ci).filter(Boolean).forEach(f=>{c.has(f)||t.push(Ht("goals","Orphaned links",`Goal ${m+1} links missing cash account "${f}".`))})})}e.scenarios?.present&&It(e.scenarios.value)&&!Array.isArray(e.scenarios.value.scenarios)&&t.push(Ht("scenarios","Saved scenarios","Saved scenario data is missing its scenario list.")),e.scenarios?.present&&It(e.scenarios.value)&&Array.isArray(e.scenarios.value.scenarios)&&_i(t,"scenarios","Duplicate IDs",e.scenarios.value.scenarios,"Scenario"),e.imports?.present&&It(e.imports.value)&&(_i(t,"imports","Duplicate IDs",e.imports.value.batches,"Import batch"),_i(t,"imports","Duplicate IDs",e.imports.value.profiles,"CSV profile")),e.priceCache?.present&&It(e.priceCache.value)&&!It(e.priceCache.value.quotes)&&t.push(Ht("priceCache","Cached prices","Cached price data is missing its quote map."));const r=Ta(Array.isArray(n.value)?n.value:[]),o=Array.isArray(n.value)?n.value.length:0;return{ok:t.every(c=>c.severity!=="error"),issues:t,eventCount:o,latestEventAt:r,checkedAt:new Date().toISOString()}}function Ya(e){return JSON.parse(JSON.stringify(e))}function At(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}const Rs="finance-master.local-first.v0",Os=Object.freeze([{schemaLabel:Rs,targetSchemaLabel:pn,migrate(e){const t=Ya(e);return{...t,ledger:Array.isArray(t.ledger)?t.ledger:[],settings:At(t.settings)?t.settings:{},ui:At(t.ui)?t.ui:{},review:At(t.review)?t.review:{},goals:At(t.goals)?t.goals:{goals:[]},imports:At(t.imports)?t.imports:{batches:[],profiles:[]},scenarios:At(t.scenarios)&&Array.isArray(t.scenarios.scenarios)?t.scenarios:{scenarios:[]},priceCache:At(t.priceCache)&&At(t.priceCache.quotes)?t.priceCache:{quotes:{}},backupMeta:At(t.backupMeta)?t.backupMeta:{lastBackupAt:null}}}},{schemaLabel:pn,targetSchemaLabel:pn,migrate(e){return Ya(e)}}]);function Qa(e){const t=[];return At(e)?(Object.prototype.hasOwnProperty.call(e,"ledger")&&e.ledger!==void 0&&!Array.isArray(e.ledger)&&t.push("Ledger events must be stored as a list."),["settings","ui","review","goals","imports","scenarios","priceCache","backupMeta"].forEach(n=>{Object.prototype.hasOwnProperty.call(e,n)&&e[n]!==void 0&&!At(e[n])&&t.push(`${n} must be stored as an object.`)}),At(e.scenarios)&&Array.isArray(e.scenarios.scenarios)===!1&&t.push("scenarios must include a scenario list."),At(e.priceCache)&&!At(e.priceCache.quotes)&&t.push("priceCache must include a quote map."),{valid:t.length===0,errors:t}):{valid:!1,errors:["Repository snapshot must be an object."]}}function _s(e,t=pn){const n=Qa(e);if(!n.valid)return{status:"failed",safeToMigrate:!1,errors:n.errors,snapshot:null};const r=Os.find(u=>u.schemaLabel===t);if(!r)return{status:"pending",safeToMigrate:!1,errors:[],snapshot:null};const o=r.migrate(e),c=Qa(o);return{status:c.valid?"current":"failed",safeToMigrate:c.valid,errors:c.errors,snapshot:c.valid?o:null}}function js(e,t=pn){const n=_s(e,t);return{status:n.status,safeToMigrate:n.safeToMigrate,errors:n.errors}}class Bs{id="manual";async getQuotes(t,n){return[]}}const Za={BTC:"bitcoin",ETH:"ethereum",SOL:"solana",USDC:"usd-coin"},Ls=8e3;class Us{id="coingecko";async getQuotes(t,n){const r=n.toLowerCase(),o=[...new Set(t.map(y=>Za[y.toUpperCase()]).filter(Boolean))];if(!o.length)return[];const c=new AbortController,u=globalThis.setTimeout(()=>c.abort(),Ls);let m;try{const y=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(o.join(","))}&vs_currencies=${encodeURIComponent(r)}`,{signal:c.signal});if(!y.ok)throw new Error("CoinGecko price refresh is temporarily unavailable.");m=await y.json()}catch(y){throw y instanceof DOMException&&y.name==="AbortError"?new Error("CoinGecko price refresh timed out."):y instanceof Error?y:new Error("CoinGecko price refresh failed.")}finally{globalThis.clearTimeout(u)}const f=new Date().toISOString();return t.flatMap(y=>{const h=Za[y.toUpperCase()],b=Number(m[h]?.[r]);return Number.isFinite(b)?[{symbol:y.toUpperCase(),currency:n.toUpperCase(),price:b,source:this.id,quotedAt:f}]:[]})}}function zs(e){return e==="coingecko"?new Us:new Bs}function Te(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Mt(e,t=!1){return t&&e===null?!0:typeof e=="string"&&e.includes("T")&&Number.isFinite(Date.parse(e))}function Sr(e,t=!1){return["personal","business","shared"].includes(e)||t&&e==="all"}function qs(e,t){if(!Array.isArray(e)){t.push("Ledger events are missing.");return}e.forEach((n,r)=>{(!Te(n)||!String(n.id||"").trim()||!String(n.type||"").trim()||!Number.isFinite(Number(n.amount))||!String(n.currency||"").trim()||!Mt(n.timestamp)||!Mt(n.created_at)||!Te(n.metadata))&&t.push(`Ledger event ${r+1} is incomplete.`)})}function Vs(e,t){(!Te(e.financeSettings)||!String(e.financeSettings.baseCurrency||"").trim()||!Number.isFinite(Number(e.financeSettings.forecastDays)))&&t.push("Finance settings are incomplete.");const n=e.uiSettings;(!Te(n)||!["dark-editorial","dark-restrained","bright-editorial","bright-minimal","color-field","monochrome-focus","aurora","midnight","twilight","bright"].includes(n.appearance)||typeof n.reducedMotion!="boolean"||!Sr(n.scopeFilter,!0)||!["manual","coingecko"].includes(n.walletPriceSource)||!Te(n.scenario)||!["marketMajors","burnDelta","probFloor"].every(r=>Number.isFinite(Number(n.scenario[r]))))&&t.push("UI settings are incomplete.")}function Hs(e,t,n){if(!Te(e)||!Mt(e.lastReviewedAt,!0)){t.push("Weekly review state is incomplete.");return}const r=Te(e.checklist)?e.checklist:{},o=typeof r.recurringCosts=="boolean"&&typeof r.pipeline=="boolean"&&typeof r.signals=="boolean",c=typeof r.unresolvedItems=="boolean"&&typeof r.matchPayments=="boolean"&&typeof r.confirmObligations=="boolean"&&typeof r.reviewSignals=="boolean"&&typeof r.closeMonth=="boolean",m=(Array.isArray(e.history)?e.history:[]).some(f=>!Te(f)||!String(f.id||"").trim()||!/^\d{4}-\d{2}$/.test(String(f.monthKey||""))||!Mt(f.closedAt)||typeof f.notes!="string"||!Te(f.accountReconciliations)||!Te(f.checklist)||!Te(f.summary)||typeof f.checklist.unresolvedItems!="boolean"||typeof f.checklist.matchPayments!="boolean"||typeof f.checklist.confirmObligations!="boolean"||typeof f.checklist.reviewSignals!="boolean"||typeof f.checklist.closeMonth!="boolean"||!/^\d{4}-\d{2}$/.test(String(f.summary.monthKey||""))||!Number.isFinite(Number(f.summary.netMovement))||!Number.isFinite(Number(f.summary.incomeReceived))||!Number.isFinite(Number(f.summary.expensesPaid))||!Number.isFinite(Number(f.summary.obligationsReviewed))||!Number.isFinite(Number(f.summary.reserveMovements))||!Number.isFinite(Number(f.summary.unresolvedItems))||!Number.isFinite(Number(f.summary.protectedCash))||!Number.isFinite(Number(f.summary.monthlyBurn))||f.summary.runwayNow!==null&&!Number.isFinite(Number(f.summary.runwayNow))||typeof f.summary.mainRisk!="string"||typeof f.summary.mainAction!="string");n===2&&(!Te(e.accountReconciliations)||!Te(e.checklist)||!o&&!c||typeof e.notes!="string"||Object.values(e.accountReconciliations).some(f=>!Te(f)||!String(f.accountId||"").trim()||!Number.isFinite(Number(f.balance))||!Mt(f.reviewedAt))||m)&&t.push("Weekly review ritual state is incomplete.")}function Ws(e,t,n){n!==1&&(!Te(e)||!Array.isArray(e.goals)||e.goals.some(r=>!Te(r)||!String(r.id||"").trim()||!String(r.name||"").trim()||!["savings","buffer"].includes(r.type)||!Number.isFinite(Number(r.targetAmount))||Number(r.targetAmount)<=0||!Sr(r.scope)||!Array.isArray(r.linkedAccountIds)||r.targetDate!==void 0&&!/^\d{4}-\d{2}-\d{2}$/.test(String(r.targetDate))||!Mt(r.createdAt)||!Mt(r.updatedAt)))&&t.push("Savings and buffer goals are incomplete.")}function Gs(e,t,n){Hs(e.review,t,n),Ws(e.goals,t,n),(!Te(e.imports)||!Array.isArray(e.imports.batches)||e.imports.batches.some(o=>!Te(o)||!String(o.id||"").trim()||!Mt(o.importedAt)||!String(o.sourceFile||"").trim()||!Array.isArray(o.fingerprints)))&&t.push("CSV import history is incomplete."),Te(e.imports)&&Array.isArray(e.imports.profiles)&&e.imports.profiles.some(o=>!Te(o)||!String(o.id||"").trim()||!String(o.name||"").trim()||!Array.isArray(o.headers)||!Te(o.mapping)||!String(o.mapping.date||"").trim()||!String(o.mapping.description||"").trim()||!Mt(o.createdAt)||!Mt(o.updatedAt))&&t.push("CSV import profiles are incomplete."),(!Te(e.prices)||!Te(e.prices.quotes))&&t.push("Cached wallet prices are incomplete.");const r=["reduce_flexible_costs","reduce_debt_pressure","add_recurring_income","protect_future_income","pause_savings_goal","increase_reserve_contribution"];e.scenarios!==void 0&&(!Te(e.scenarios)||!Array.isArray(e.scenarios.scenarios)||e.scenarios.scenarios.some(o=>!Te(o)||!String(o.id||"").trim()||!String(o.name||"").trim()||!r.includes(String(o.type||""))||!Number.isFinite(Number(o.amount))||Number(o.amount)<0||o.protectPercent!==void 0&&(!Number.isFinite(Number(o.protectPercent))||Number(o.protectPercent)<0||Number(o.protectPercent)>100)||!Mt(o.createdAt)||!Mt(o.updatedAt)))&&t.push("Saved scenarios are incomplete.")}function da(e,t){return new Set((Array.isArray(e)?e:[]).filter(n=>n&&n.type===t).map(n=>String(n.related_entity_id||n.id||"")).filter(Boolean)).size}function Ea(e,t={}){const n=[],r=[];if(!Te(e))return{valid:!1,counts:{},errors:["Backup must be a JSON object."],warnings:r};ws.includes(e.version)||n.push("Backup version is not supported."),Mt(e.exportedAt)||n.push("Backup export date is missing or invalid."),qs(e.ledger,n),Vs(e,n),Gs(e,n,e.version);const o=Array.isArray(e.ledger)?e.ledger:[],c=Date.parse(String(t.latestLocalEventAt||"")),u=Date.parse(String(e.exportedAt||""));Number.isFinite(c)&&Number.isFinite(u)&&u<c&&r.push("This backup is older than your newest local finance event.");const m=Te(e.metadata)?e.metadata:wr(e,pn,wa);return{valid:n.length===0,version:e.version,currentVersion:Sa,schemaLabel:String(m.schemaLabel||pn),appName:String(m.appName||wa),exportedAt:Mt(e.exportedAt)?e.exportedAt:void 0,latestLocalEventAt:Ta(o)||void 0,counts:{ledgerEvents:o.length,accounts:da(o,"asset.account_set"),recurringCosts:da(o,"expense.recurring_set"),pipelineItems:da(o,"pipeline.created"),goals:Array.isArray(e.goals?.goals)?e.goals.goals.length:0,importBatches:Array.isArray(e.imports?.batches)?e.imports.batches.length:0,scenarios:Array.isArray(e.scenarios?.scenarios)?e.scenarios.scenarios.length:0,cachedQuotes:Te(e.prices?.quotes)?Object.keys(e.prices.quotes).length:0},errors:n,warnings:r}}function Ks(e){const t=Ea(e);if(!t.valid||e.version!==1)throw new Error(t.errors.concat(e.version===1?[]:["Backup is not version 1."]).join(" "));return e}function Ys(e){const t=Ks(e);return{...t,version:2,review:{lastReviewedAt:t.review.lastReviewedAt,accountReconciliations:{},checklist:{recurringCosts:!1,pipeline:!1,signals:!1},notes:""},goals:{goals:[]}}}function Qs(e){const t=Ea(e);if(!t.valid)throw new Error(t.errors.join(" "));return e.version===1?Ys(e):e}const Zs=["personal","business","shared"],$r=24;function Ge(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function Js(e){return Array.isArray(e)?e:[]}function Xs(e,t="shared"){return Zs.includes(e)?e:t}function ec(e,t){return t==="all"||e===t||e==="shared"}function $a(e){const t=Ge(e)?e:{},n=Ge(t.accountReconciliations)?t.accountReconciliations:{},r={};Object.entries(n).forEach(([y,h])=>{if(!Ge(h)||!String(h.accountId||y).trim())return;const b=Number(h.balance),_=String(h.reviewedAt||"");!Number.isFinite(b)||!Number.isFinite(Date.parse(_))||(r[y]={accountId:String(h.accountId||y),balance:b,reviewedAt:_})});const o=Ge(t.checklist)?t.checklist:{},c=(t.lastReviewedAt===null||Number.isFinite(Date.parse(String(t.lastReviewedAt||""))))&&t.lastReviewedAt||null,u={unresolvedItems:o.unresolvedItems===!0||o.recurringCosts===!0,matchPayments:o.matchPayments===!0,confirmObligations:o.confirmObligations===!0||o.pipeline===!0,reviewSignals:o.reviewSignals===!0||o.signals===!0,closeMonth:o.closeMonth===!0},m=Array.isArray(t.history)?t.history.flatMap(y=>{if(!Ge(y)||!String(y.monthKey||"").match(/^\d{4}-\d{2}$/)||!Number.isFinite(Date.parse(String(y.closedAt||""))))return[];const h=Ge(y.summary)?y.summary:{},b=Ge(y.accountReconciliations)?y.accountReconciliations:{},_=String(y.closedAt),B={id:String(y.id||`${y.monthKey}-${_}`),monthKey:String(y.monthKey),closedAt:_,notes:typeof y.notes=="string"?y.notes:"",accountReconciliations:Object.fromEntries(Object.entries(b).flatMap(([N,x])=>{if(!Ge(x)||!String(x.accountId||N).trim())return[];const q=Number(x.balance),H=String(x.reviewedAt||_);return!Number.isFinite(q)||!Number.isFinite(Date.parse(H))?[]:[[N,{accountId:String(x.accountId||N),balance:q,reviewedAt:H}]]})),checklist:{unresolvedItems:Ge(y.checklist)&&y.checklist.unresolvedItems===!0,matchPayments:Ge(y.checklist)&&y.checklist.matchPayments===!0,confirmObligations:Ge(y.checklist)&&y.checklist.confirmObligations===!0,reviewSignals:Ge(y.checklist)&&y.checklist.reviewSignals===!0,closeMonth:Ge(y.checklist)&&y.checklist.closeMonth===!0},summary:{monthKey:String(h.monthKey||y.monthKey),netMovement:Number(h.netMovement)||0,incomeReceived:Number(h.incomeReceived)||0,expensesPaid:Number(h.expensesPaid)||0,obligationsReviewed:Number(h.obligationsReviewed)||0,reserveMovements:Number(h.reserveMovements)||0,runwayNow:Number.isFinite(Number(h.runwayNow))?Number(h.runwayNow):null,unresolvedItems:Number(h.unresolvedItems)||0,protectedCash:Number(h.protectedCash)||0,monthlyBurn:Number(h.monthlyBurn)||0,forecastHorizonDays:Number.isFinite(Number(h.forecastHorizonDays))?Number(h.forecastHorizonDays):void 0,forecastExpectedCash:Number.isFinite(Number(h.forecastExpectedCash))?Number(h.forecastExpectedCash):null,forecastLowestCash:Number.isFinite(Number(h.forecastLowestCash))?Number(h.forecastLowestCash):null,forecastWarning:typeof h.forecastWarning=="string"?h.forecastWarning:"",mainRisk:typeof h.mainRisk=="string"?h.mainRisk:"No major close risk detected.",mainAction:typeof h.mainAction=="string"?h.mainAction:"Keep next month reviewed on the same cadence."}};return Ge(y.chosenFocus)&&String(y.chosenFocus.id||"").trim()&&(B.chosenFocus={id:String(y.chosenFocus.id),title:String(y.chosenFocus.title||"Weekly focus")}),[B]}).slice(0,$r):[],f={lastReviewedAt:c,accountReconciliations:r,checklist:u,notes:typeof t.notes=="string"?t.notes:"",history:m};return Ge(t.chosenFocus)&&String(t.chosenFocus.id||"").trim()&&(f.chosenFocus={id:String(t.chosenFocus.id),title:String(t.chosenFocus.title||"Weekly focus")}),f}function tc({previousReview:e={},summary:t={},accounts:n=[],checklist:r={},nowIso:o=new Date().toISOString(),notes:c="",chosenFocus:u=null}={}){const m=$a(e),f=Number.isFinite(Date.parse(String(o||"")))?String(o):new Date().toISOString(),y=String(t&&t.monthKey||f.slice(0,7)),h=Object.fromEntries(Js(n).flatMap(q=>{const H=String(q&&q.accountId||"").trim(),fe=Number(q&&q.balance);return!H||!Number.isFinite(fe)?[]:[[H,{accountId:H,balance:fe,reviewedAt:f}]]})),b={unresolvedItems:r.unresolvedItems===!0,matchPayments:r.matchPayments===!0,confirmObligations:r.confirmObligations===!0,reviewSignals:r.reviewSignals===!0,closeMonth:r.closeMonth===!0},_=Ge(u)&&String(u.id||"").trim()?{id:String(u.id),title:String(u.title||"Weekly focus")}:void 0,B={id:`${y}-${f}`,monthKey:y,closedAt:f,notes:String(c||""),accountReconciliations:h,checklist:b,summary:t};_&&(B.chosenFocus=_);const N=[B,...m.history.filter(q=>q.monthKey!==y)].slice(0,$r),x={lastReviewedAt:f,accountReconciliations:h,checklist:b,notes:String(c||""),history:N};return _&&(x.chosenFocus=_),$a(x)}function Ir(e){return{goals:(Ge(e)&&Array.isArray(e.goals)?e.goals:[]).flatMap(n=>{if(!Ge(n)||!String(n.id||"").trim()||!String(n.name||"").trim())return[];const r=Number(n.targetAmount);if(!Number.isFinite(r)||r<=0)return[];const o=Number.isFinite(Date.parse(String(n.createdAt||"")))?String(n.createdAt):new Date().toISOString(),c=Number.isFinite(Date.parse(String(n.updatedAt||"")))?String(n.updatedAt):o;return[{id:String(n.id),name:String(n.name),type:n.type==="savings"?"savings":"buffer",targetAmount:r,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(n.targetDate||""))?String(n.targetDate):void 0,scope:Xs(n.scope),linkedAccountIds:Array.isArray(n.linkedAccountIds)?n.linkedAccountIds.map(String).filter(Boolean):[],createdAt:o,updatedAt:c}]})}}function nc(e,t,n="all"){const r=new Map((Array.isArray(t)?t:[]).map(o=>[String(o.id),o]));return Ir(e).goals.filter(o=>ec(o.scope,n)).map(o=>{const c=o.linkedAccountIds.reduce((u,m)=>{const f=r.get(m);return u+Math.max(0,Number(f&&f.balance)||0)},0);return{...o,currentAmount:c,progressPercent:Math.min(100,Math.max(0,c/o.targetAmount*100))}})}function zi(e){return Array.isArray(e)?e:[]}function An(e){return Math.round((Number(e)||0)*100)/100}function ic(e){const t=String(e||"");if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);const n=Date.parse(t);return Number.isFinite(n)?new Date(n).toISOString().slice(0,10):""}function Ja(e){return(ic(e)||new Date().toISOString().slice(0,10)).slice(0,7)}function ua(e){if(Number.isFinite(Number(e&&e.signedAmount)))return Number(e.signedAmount);const t=Math.abs(Number(e&&e.amount)||0),n=String(e&&e.direction||"").toLowerCase(),r=String(e&&(e.ledgerType||e.type)||"").toLowerCase();return n==="out"||r.includes("expense")||r.includes("payment")?-t:t}function ac(e,t=[]){if(String(e&&e.linkedReserveId||"").trim())return String(e.linkedReserveId);if(String(e&&(e.ledgerType||e.type)||"").toLowerCase()!=="transfer")return"";const r=new Map(zi(t).map(c=>[String(c&&c.id||""),c])),o=[String(e&&(e.fromAccountId||e.accountId)||""),String(e&&(e.toAccountId||e.destinationAccountId)||"")].filter(Boolean);return o.some(c=>{const u=r.get(c);return!!(u&&(u.reserved===!0||String(u.bucket||"available")!=="available"))})?o.join(" -> "):""}function rc({unresolvedItems:e,runwayNow:t,monthlyBurn:n,protectedCash:r,forecastWarning:o}){return e>0?"Open items need review before the checkpoint is fully reliable.":o||(t!=null&&t<3?"Runway is below three months.":n>0&&r<=0?"No protected cash is recorded for upcoming reserves.":"No major checkpoint risk detected.")}function oc({unresolvedItems:e,runwayNow:t,protectedCash:n,forecastWarning:r}){return e>0?"Resolve open items in Records.":r?"Review the forecast before saving the next checkpoint.":t!=null&&t<3?"Review burn pressure and upcoming income.":n<=0?"Review reserve targets in Money Plan.":"Keep next month reviewed on the same cadence."}function Ar({readModel:e={},snapshot:t={},treasury:n={},reviewQueue:r=[],forecast:o=null,nowIso:c=new Date().toISOString()}={}){const u=Ja(c),m=zi(e.fiatAccounts),f=zi(e.transactions).filter(C=>Ja(C&&C.timestamp)===u),y=f.filter(C=>String(C&&(C.ledgerType||C.type))==="income.received").reduce((C,F)=>C+Math.abs(ua(F)),0),h=f.filter(C=>String(C&&(C.ledgerType||C.type))==="expense.recorded"&&String(C&&C.categoryId||"").toLowerCase()!=="transfer").reduce((C,F)=>C+Math.abs(ua(F)),0),b=f.reduce((C,F)=>C+ua(F),0),_=f.filter(C=>String(C&&C.obligationId||"").trim()).length,B=f.filter(C=>ac(C,m)).length,N=zi(r).length,x=Number(t.runwayMonths??n.runwayMonths),q=Number.isFinite(x)?An(x):null,H=An(Number(n.protectedCash??t.protectedCash??0)),fe=An(Number(n.totalMonthlyBurn??t.monthlyBurn??0)),K=o&&o.byHorizon&&o.byHorizon[30]||null||(o&&Array.isArray(o.horizons)?o.horizons[0]:null),W=String(o&&Array.isArray(o.warnings)&&o.warnings[0]||""),re=K?Number(K.days):void 0,le=K?An(Number(K.expected)):null,Ne=o&&Number.isFinite(Number(o.lowestExpected))?An(Number(o.lowestExpected)):null,Ae={unresolvedItems:N,runwayNow:q,monthlyBurn:fe,protectedCash:H,forecastWarning:W};return{monthKey:u,netMovement:An(b),incomeReceived:An(y),expensesPaid:An(h),obligationsReviewed:_,reserveMovements:B,runwayNow:q,unresolvedItems:N,protectedCash:H,monthlyBurn:fe,forecastHorizonDays:re,forecastExpectedCash:le,forecastLowestCash:Ne,forecastWarning:W,mainRisk:rc(Ae),mainAction:oc(Ae)}}function ot(e){return Array.isArray(e)?e:[]}function Ye(e){return Math.round((Number(e)||0)*100)/100}function sc(e){const t=Number(e);return Number.isFinite(t)?Math.max(0,Math.min(1,t)):0}function Ki(e){const t=String(e||"");if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);const n=Date.parse(t);return Number.isFinite(n)?new Date(n).toISOString().slice(0,10):""}function cc(e,t){const n=new Date(e);return Number.isFinite(n.getTime())?(n.setUTCDate(n.getUTCDate()+Number(t||0)),n.toISOString().slice(0,10)):""}function Pa(e){return String(e&&(e.status||e.stage)||"expected").toLowerCase()}function Ia(e){const t=Ra(Pa(e));return!["paid","cancelled","lost"].includes(t)}const Xa={lead:.15,proposal:.4,expected:.6,confirmed:.9,invoiced:.95,due:.95,overdue:.85,risky:.35,retainer:.9,recurring:.9,paid:1,received:1,cancelled:0,lost:0};function lc(e){if(Number.isFinite(Number(e&&e.probability)))return sc(e.probability);const t=String(e&&e.incomeType||"").toLowerCase();return t==="retainer"||t==="recurring"?Xa[t]:Xa[Ra(Pa(e))]??.6}function Ra(e){const t=String(e||"expected").toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return t==="open"||t==="manual_expected_income"?"expected":t==="signed"||t==="verbal_commitment"?"confirmed":t==="invoice_sent"||t==="sent"?"invoiced":t==="received"||t==="settled"||t==="closed"?"paid":t==="deleted"?"cancelled":t==="opportunity"?"lead":t}function Mr(e,t){const n=Ra(Pa(e)),r=Math.max(0,Number(e&&(e.value??e.amount))||0),o=lc(e),c=String(e&&e.incomeType||"").toLowerCase();return t==="conservative"?["confirmed","invoiced","due","overdue"].includes(n)&&o>=.85?r*o:0:t==="expected"?["confirmed","invoiced","due","overdue"].includes(n)&&o>=.85||(["expected"].includes(n)||c==="retainer"||c==="recurring")&&o>=.5?r*o:0:t==="optimistic"?["lead","proposal","risky"].includes(n)&&o>0?r*o:Mr(e,"expected"):0}function Nr(e,t,n){return e?e>=t&&e<=n:!1}function Dr(e){const t=String(e&&e.incomeType||"").toLowerCase();return t==="retainer"||t==="recurring"}function dc(e){const t=String(e&&e.durationUnit||"").toLowerCase(),n=Number(e&&e.durationValue);return!Number.isFinite(n)||n<=0?1/0:t==="months"||t==="times"?Math.max(1,Math.floor(n)):1/0}function Cr(e,t,n){if(!Dr(e))return 1;const r=Ki(e&&e.expectedDateISO)||t;if(r>n)return 0;const o=r<t?t:r,c=Date.parse(`${o}T00:00:00.000Z`),u=Date.parse(`${n}T00:00:00.000Z`);if(!Number.isFinite(c)||!Number.isFinite(u)||u<c)return 0;const m=Math.max(1,Math.floor((u-c)/(720*60*60*1e3))+1),f=dc(e);if(!Number.isFinite(f))return m;const y=Date.parse(`${r}T00:00:00.000Z`),h=Date.parse(`${t}T00:00:00.000Z`),b=r<t&&Number.isFinite(y)&&Number.isFinite(h)?Math.max(0,Math.floor((h-y)/(720*60*60*1e3))):0;return Math.max(0,Math.min(m,f-b))}function ma(e,t,n,r){return ot(e).reduce((o,c)=>{const u=Cr(c,n,r);return u?o+Mr(c,t)*u:o},0)}function xr(e){return ot(e&&e.reserveBuckets).reduce((t,n)=>{const r=Math.max(0,Number(n&&n.targetAmount)||0),o=Math.max(0,Number(n&&n.currentAmount)||0);return t+Math.max(0,r-o)},0)}function uc(e,t,n){return ot(e&&e.transactions).filter(r=>{if(String(r&&(r.ledgerType||r.type)||"").toLowerCase()!=="transfer"&&!String(r&&r.linkedReserveId||"").trim())return!1;const c=Ki(r&&r.timestamp);return Nr(c,t,n)}).length}function mc({readModel:e,snapshot:t,treasury:n,today:r,days:o}){const c=cc(r,o),u=Number((n&&n.availableCash)??(t&&t.availableCash)??(n&&n.trulyAvailableCash)??0),m=Math.max(0,Number((n&&n.totalMonthlyBurn)??(t&&t.monthlyBurn)??0)||0),f=Ye(m*(o/30)),y=Ye(ot(e&&e.debtAccounts).reduce((q,H)=>q+Math.max(0,Number(H&&H.monthlyPressure)||Number(H&&H.minimumPaymentMonthly)||0),0)*(o/30)),h=ot(e&&e.pipelineDeals).filter(Ia).filter(q=>Dr(q)?Cr(q,r,c)>0:Nr(Ki(q&&q.expectedDateISO),r,c)),b=Ye(xr(e)),_=uc(e,r,c),B=Ye(ma(h,"conservative",r,c)),N=Ye(ma(h,"expected",r,c)),x=Ye(ma(h,"optimistic",r,c));return{days:o,horizonEnd:c,conservative:Ye(u-f+B),expected:Ye(u-f+N),optimistic:Ye(u-f+x),components:{startingAvailableCash:Ye(u),recurringObligations:f,debtPaymentPlans:y,reserveTargetGap:b,reserveMovements:_,conservativeIncome:B,expectedIncome:N,optimisticIncome:x,incomingCash:N,outgoingCash:f,endingCash:Ye(u-f+N)}}}function Hi({readModel:e={},snapshot:t={},treasury:n={},nowIso:r=new Date().toISOString(),horizons:o=[7,30,60,90,180]}={}){const c=Ki(r)||new Date().toISOString().slice(0,10),u=ot(o).map(B=>Math.max(1,Math.floor(Number(B)||0))).filter(Boolean).map(B=>mc({readModel:e,snapshot:t,treasury:n,today:c,days:B})),m=Object.fromEntries(u.map(B=>[String(B.days),B])),f=u.reduce((B,N)=>Math.min(B,Number(N.expected)),Number.POSITIVE_INFINITY),y=[];ot(e&&e.pipelineDeals).some(Ia)||y.push("No active income forecast is recorded."),ot(e&&e.pipelineDeals).some(B=>Ia(B)&&["overdue","severely_overdue"].includes(String(B&&B.dueState||"").toLowerCase()))&&y.push("Overdue income may make this forecast unreliable."),Number.isFinite(f)&&f<0&&y.push("Expected forecast dips below available cash.");const h=Number((n&&n.availableCash)??(t&&t.availableCash));Number.isFinite(h)&&h<0&&y.push("Available cash is already negative.");const b=Number(t&&(t.confidenceScore??t.forecastConfidence));return Number.isFinite(b)&&b<.6&&y.push("Forecast confidence is low because some inputs need review."),Ye(xr(e))>0&&y.push("Reserve targets are not fully funded."),ot(e&&e.debtAccounts).some(B=>(Number(B&&B.outstanding)||0)>0&&String(B&&B.planStatus||(Number(B&&B.minimumPaymentMonthly)>0?"active":"missing"))==="missing")&&y.push("Some debt items still need payment plans."),{generatedAt:r,horizons:u,byHorizon:m,warnings:y,lowestExpected:Number.isFinite(f)?Ye(f):null}}function Oa({readModel:e={},treasury:t={}}={}){const n=ot(e&&e.reserveBuckets).filter(y=>y&&y.active!==!1),r=Ye(n.reduce((y,h)=>y+Math.max(0,Number(h&&h.targetAmount)||0),0)),o=Ye(n.reduce((y,h)=>y+Math.max(0,Number(h&&h.currentAmount)||0),0)),c=Ye(Number((t&&t.protectedCash)??(t&&t.reservedCash)??o)||0),u=Ye(Math.max(0,r-o)),m=r>0?Math.min(100,Math.round(o/r*100)):c>0?100:0;return{status:r<=0?c>0?"funded":"unconfigured":u<=0?"funded":m>=50?"partial":"thin",targetAmount:r,currentAmount:o,protectedCash:c,gap:u,coveragePercent:m,bucketCount:n.length}}function _a(e={}){const t=ot(e&&e.horizons);if(!t.length)return{status:"unknown",lowestAmount:null,lowestDate:"",horizonDays:null,cause:"Add forecast inputs to reveal future tight spots.",suggestedAction:"Add expected income and recurring obligations."};const n=t.reduce((h,b)=>h?Number(b&&b.expected)<Number(h&&h.expected)?b:h:b,null),r=Ye(Number(n&&n.expected)||0),o=ot(e&&e.warnings)[0]||"",c=n&&n.components||{},u=Number(c.recurringObligations||c.outgoingCash||0),m=Number(c.expectedIncome||c.incomingCash||0),f=o||(u>m?"Recurring obligations exceed expected income in this window.":"Lowest projected balance comes from the current forecast mix."),y=r<0?"Pull confirmed income forward or reduce near-term obligations.":u>m?"Review upcoming obligations and expected income timing.":"Keep Cash Timeline current and watch the next forecast low.";return{status:r<0?"shortfall":r<Math.max(250,u*.1)?"tight":"clear",lowestAmount:r,lowestDate:String(n&&n.horizonEnd||""),horizonDays:Number(n&&n.days)||null,cause:f,suggestedAction:y}}function pc({snapshot:e={},treasury:t={},forecast:n={},reserveHealth:r=null}={}){const o=r||Oa({readModel:{},treasury:t}),c=Number((t&&t.safeToSpend)??(e&&e.safeToSpend)),u=Number((t&&t.availableCash)??(e&&e.availableCash)),m=Number((t&&t.runwayMonths)??(e&&e.runwayMonths)),f=ot(n&&n.warnings),y=_a(n);let h="Clear",b="Cash, runway, and reserves are in a usable range.",_="Keep the weekly review cadence.";return Number.isFinite(c)&&c<0||Number.isFinite(u)&&u<0||y.status==="shortfall"?(h="Stormy",b=y.status==="shortfall"?y.cause:"Available cash is below committed pressure.",_=y.status==="shortfall"?y.suggestedAction:"Cover near-term obligations before optional spending."):Number.isFinite(m)&&m<2||f.some(B=>/debt|confidence|overdue/i.test(String(B)))?(h="Tight",b=Number.isFinite(m)&&m<2?"Runway is under two months.":f[0],_="Review income timing, debt plans, and recurring burn."):Number.isFinite(c)&&c<Math.max(250,Number(t&&t.minimumBuffer)||0)||o.status==="thin"||y.status==="tight"?(h="Watchful",b=o.status==="thin"?"Reserve coverage is below target.":"The forecast has a tight low point.",_="Review reserves and the next cashflow low."):(f.length||o.status==="partial")&&(h="Stable",b=f[0]||"Core cash is steady, with one planning gap to watch.",_="Keep Money Plan and Cash Timeline current."),{state:h,reason:b,suggestedAction:_}}function fc({readModel:e={},snapshot:t={},treasury:n={},forecast:r={},reserveHealth:o=null}={}){const c=o||Oa({readModel:e,treasury:n}),u=_a(r),m=[],f=b=>{!b||!b.title||m.push({title:String(b.title),severity:b.severity||"info",reason:String(b.reason||""),recommendedAction:String(b.recommendedAction||"Review this item."),source:b.source||"Money Status"})};(u.status==="shortfall"||u.status==="tight")&&f({title:u.status==="shortfall"?"Forecast shortfall":"Tight forecast low",severity:u.status==="shortfall"?"critical":"warning",reason:u.cause,recommendedAction:u.suggestedAction,source:"Cash Timeline"}),(c.status==="thin"||c.status==="partial"||c.status==="unconfigured")&&f({title:c.status==="unconfigured"?"Reserve plan missing":"Reserve target gap",severity:c.status==="thin"?"warning":"info",reason:c.status==="unconfigured"?"No active reserve target is configured.":`${c.coveragePercent}% of reserve targets are funded.`,recommendedAction:"Review reserve targets in Money Plan.",source:"Money Plan"}),ot(e&&e.debtAccounts).some(b=>(Number(b&&b.outstanding)||0)>0&&String(b&&b.planStatus||(Number(b&&b.minimumPaymentMonthly)>0?"active":"missing"))==="missing")&&f({title:"Debt payment plan missing",severity:"warning",reason:"A debt item has outstanding balance without a normalized payment plan.",recommendedAction:"Add a payment plan so burn and runway stay accurate.",source:"Money Plan"});const y=ot(n&&n.reviewQueue).length||ot(t&&t.attentionQueue).length;y>0&&f({title:"Open review items",severity:y>=5?"warning":"info",reason:`${y} item${y===1?"":"s"} need classification, matching, or a decision.`,recommendedAction:"Clear the most important items in Reality Check.",source:"Reality Check"}),m.length||f({title:"No major signal",severity:"info",reason:"The current local data does not show an urgent imbalance.",recommendedAction:"Keep the weekly review cadence.",source:"Risk Radar"});const h={critical:3,warning:2,info:1};return m.sort((b,_)=>(h[_.severity]||0)-(h[b.severity]||0)).slice(0,5)}function gc({readModel:e={},snapshot:t={},treasury:n={},nowIso:r=new Date().toISOString()}={}){const o=Hi({readModel:e,snapshot:t,treasury:n,nowIso:r}),c=Oa({readModel:e,treasury:n});return{forecast:o,reserveHealth:c,dangerZone:_a(o),financialWeather:pc({snapshot:t,treasury:n,forecast:o,reserveHealth:c}),topSignals:fc({readModel:e,snapshot:t,treasury:n,forecast:o,reserveHealth:c})}}const yi={baseCurrency:"EUR",forecastDays:90},pa={appearance:"dark-editorial",reducedMotion:!1,scopeFilter:"all",walletPriceSource:"manual",scenario:{marketMajors:0,burnDelta:0,probFloor:50}},er={lastReviewedAt:null,accountReconciliations:{},checklist:{unresolvedItems:!1,matchPayments:!1,confirmObligations:!1,reviewSignals:!1,closeMonth:!1},notes:"",history:[]},tr={goals:[]},nr={batches:[],profiles:[]},ir={quotes:{}},ar={scenarios:[]},vc={lastBackupAt:null};let rr=yr({indexedDbAvailable:!1,localStorageAvailable:!1,quotaAvailable:!1}),or="current";const hc=Object.freeze({__financeMasterMissing:!0});function qe(e){return JSON.parse(JSON.stringify(e))}function fn(e){return!!e&&typeof e=="object"&&!Array.isArray(e)}function vn(e,t){return Vi(e,t)}function Oe(e,t){ri(e,t)}function ni(e,t,n,r){const o=Number(e);return Number.isFinite(o)?Math.min(n,Math.max(t,o)):r}function sr(e,t="dark-editorial"){const n=String(e||"").trim().toLowerCase();return n==="dark-editorial"||n==="aurora"?"dark-editorial":n==="dark-restrained"||n==="midnight"||n==="twilight"?"dark-restrained":n==="bright-editorial"||n==="bright"?"bright-editorial":n==="bright-minimal"?"bright-minimal":n==="color-field"?"color-field":n==="monochrome-focus"||n==="monochrome"?"monochrome-focus":t}function De(e,t="shared"){return e==="personal"||e==="business"||e==="shared"?e:t}function cr(e,t="all"){return e==="all"?e:De(e,t==="all"?"shared":t)}function at(e){return String(e||"").trim()}function nn(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function Aa(e){return Array.isArray(e)?e.map(t=>String(t||"").trim().toLowerCase()).filter(Boolean).join("|"):""}function kr(e){const t=fn(e)?e:{};return{date:String(t.date||""),description:String(t.description||""),amount:String(t.amount||""),debit:String(t.debit||""),credit:String(t.credit||""),category:String(t.category||""),scope:String(t.scope||"")}}function bc(e){const t=fn(e)?e:{},n=Array.isArray(t.batches)?t.batches.filter(fn).map(c=>({id:String(c.id||""),importedAt:String(c.importedAt||""),sourceFile:String(c.sourceFile||""),fingerprints:Array.isArray(c.fingerprints)?c.fingerprints.map(String).filter(Boolean):[],accountId:String(c.accountId||"")||void 0,importedCount:Number.isFinite(Number(c.importedCount))?Number(c.importedCount):void 0,duplicateCount:Number.isFinite(Number(c.duplicateCount))?Number(c.duplicateCount):void 0,duplicateImportedCount:Number.isFinite(Number(c.duplicateImportedCount))?Number(c.duplicateImportedCount):void 0,rejectedCount:Number.isFinite(Number(c.rejectedCount))?Number(c.rejectedCount):void 0,duplicatePolicy:c.duplicatePolicy==="import"?"import":c.duplicatePolicy==="skip"?"skip":void 0,incomeTotal:Number.isFinite(Number(c.incomeTotal))?Number(c.incomeTotal):void 0,expenseTotal:Number.isFinite(Number(c.expenseTotal))?Number(c.expenseTotal):void 0,dateFrom:/^\d{4}-\d{2}-\d{2}$/.test(String(c.dateFrom||""))?String(c.dateFrom):void 0,dateTo:/^\d{4}-\d{2}-\d{2}$/.test(String(c.dateTo||""))?String(c.dateTo):void 0})).filter(c=>c.id&&c.importedAt&&c.sourceFile):[],r=Array.isArray(t.profiles)?t.profiles.filter(fn).map(c=>{const u=Array.isArray(c.headers)?c.headers.map(String).filter(Boolean):[];return{id:String(c.id||""),name:String(c.name||"CSV mapping"),headers:u,mapping:kr(c.mapping),accountId:String(c.accountId||"")||void 0,defaultCategory:String(c.defaultCategory||"uncategorized"),defaultScope:De(c.defaultScope,"business"),createdAt:String(c.createdAt||c.updatedAt||new Date(0).toISOString()),updatedAt:String(c.updatedAt||c.createdAt||new Date(0).toISOString())}}).filter(c=>c.id&&Aa(c.headers)):[],o=String(t.lastProfileId||"");return{batches:n,profiles:r,...o?{lastProfileId:o}:{}}}function Fr(e){const t=String(e||"").trim().toLowerCase();return["reduce_flexible_costs","reduce_debt_pressure","add_recurring_income","protect_future_income","pause_savings_goal","increase_reserve_contribution"].includes(t)?t:"reduce_flexible_costs"}function yc(e){const t=fn(e)?e:{},n=Array.isArray(t.scenarios)?t.scenarios.filter(fn).map(o=>{const c=new Date().toISOString(),u=Fr(o.type),m=String(o.updatedAt||o.createdAt||c);return{id:String(o.id||nn("scenario")),name:String(o.name||u.replace(/_/g," ")),type:u,amount:Math.max(0,Number(o.amount)||0),protectPercent:Number.isFinite(Number(o.protectPercent))?Math.max(0,Math.min(100,Number(o.protectPercent))):void 0,createdAt:String(o.createdAt||m),updatedAt:m}}).filter(o=>o.id&&o.name):[],r=String(t.selectedScenarioId||"");return{scenarios:n,...r&&n.some(o=>o.id===r)?{selectedScenarioId:r}:{}}}function fa(e){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function wc(e,t){if(t==="all")return!0;const n=De(e.metadata?.scope);return n===t||n==="shared"}function Xt(e,t){window.dispatchEvent(new CustomEvent("finance:updated",{detail:{snapshot:qe(e),context:{source:t}}}))}const qi=new Map;function oi(){qi.clear()}function Mn(){const e=vn(ae.ledger,[]);return Array.isArray(e)?e:[]}function ga(e){Oe(ae.ledger,e),oi()}function rt(e){const t=Vi(e,hc),n=!(fn(t)&&t.__financeMasterMissing===!0);return{present:n,value:n?t:void 0}}function Ee(e,t){const n=Date.parse(String(t||""));let r=Number.isFinite(n)?n:Date.now();const o=te.getFinanceLedger().filter(c=>String(c.related_entity_id||"")===e).reduce((c,u)=>Math.max(c,Date.parse(u.timestamp)||0),0);return o>=r&&(r=o+1),new Date(r).toISOString()}function Sc(e){return{type:"asset.account_set",amount:0,currency:e.currency,timestamp:e.timestamp,related_entity_id:nn("cash"),metadata:{name:"Operating cash",balance:0,active:!0,scope:e.scope,bucket:"available",reserved:!1,source:"first-transaction-default-account"}}}function $c(e){const t=String(e??"");return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function Ic(e){return window.FinanceDates?.toDateOnly?.(e)||String(e||"").slice(0,10)}function _n(e,t,n,r){const o=te.getFinanceSettings().baseCurrency,c=Ee(e),u=te.getActiveFinanceEvents().filter(m=>t.includes(m.type)).filter(m=>r?r(m):String(m.related_entity_id||"")===e).map(m=>({type:"finance.event_reversed",amount:0,currency:m.currency||o,timestamp:c,related_entity_id:m.id,metadata:{entity_id:e,reason:n,reversed_event_id:m.id}}));return u.length?te.appendFinanceEvents(u,{source:n}):[]}const te={async initialize(){await ks([ae.ledger,ae.settings,ae.ui,ae.review,ae.goals,ae.imports,ae.scenarios,ae.priceCache,ae.backupMeta,ae.demoSeed]),rr=await Es(window),or=js({ledger:rt(ae.ledger).value,settings:rt(ae.settings).value,ui:rt(ae.ui).value,review:rt(ae.review).value,goals:rt(ae.goals).value,imports:rt(ae.imports).value,scenarios:rt(ae.scenarios).value,priceCache:rt(ae.priceCache).value},pn).status},getFinanceSettings(){const e=vn(ae.settings,yi);return fn(e)?{baseCurrency:String(e.baseCurrency||yi.baseCurrency).trim().toUpperCase()||"EUR",forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||yi.forecastDays))}:qe(yi)},getSampleDataStatus(){const e=String(Vi(ae.demoSeed,"")||""),t=Mn().length;return{isSampleData:e==="1",seedState:e,eventCount:t}},saveFinanceSettings(e){const t=this.getFinanceSettings(),n={baseCurrency:String(e.baseCurrency||t.baseCurrency).trim().toUpperCase()||t.baseCurrency,forecastDays:Math.max(1,Math.floor(Number(e.forecastDays)||t.forecastDays))};return Oe(ae.settings,n),oi(),Xt(this.getFinancialSnapshot(!0),"saveFinanceSettings"),n},getUiSettings(){const e=vn(ae.ui,pa);if(!fn(e))return qe(pa);const t=fn(e.scenario)?e.scenario:{};return{appearance:sr(e.appearance),reducedMotion:e.reducedMotion===!0,scopeFilter:cr(e.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":"manual",scenario:{marketMajors:ni(t.marketMajors,-50,50,0),burnDelta:ni(t.burnDelta,-30,30,0),probFloor:ni(t.probFloor,0,100,50)}}},saveUiSettings(e){const t=this.getUiSettings(),n=e.scenario||t.scenario,r={appearance:sr(e.appearance,t.appearance),reducedMotion:typeof e.reducedMotion=="boolean"?e.reducedMotion:t.reducedMotion,scopeFilter:cr(e.scopeFilter,t.scopeFilter),walletPriceSource:e.walletPriceSource==="coingecko"?"coingecko":e.walletPriceSource==="manual"?"manual":t.walletPriceSource,scenario:{marketMajors:ni(n.marketMajors,-50,50,t.scenario.marketMajors),burnDelta:ni(n.burnDelta,-30,30,t.scenario.burnDelta),probFloor:ni(n.probFloor,0,100,t.scenario.probFloor)}};return Oe(ae.ui,r),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:qe(r)})),r},getFinanceLedger(){const e=Mn();return window.FinanceEvents?.sortFinancialEvents?qe(window.FinanceEvents.sortFinancialEvents(e)):qe(e)},getActiveFinanceEvents(){const e=Mn();return window.FinanceLedger?.getActiveEvents?qe(window.FinanceLedger.getActiveEvents(e)):qe(e)},computeFinanceContext(e=!1,t="all"){if(!e&&qi.has(t))return qe(qi.get(t));if(!window.FinanceCompute?.computeFinancialContext)throw new Error("Finance compute module is unavailable.");const n=this.getFinanceSettings(),r=Mn().filter(c=>wc(c,t)),o=window.FinanceCompute.computeFinancialContext(r,{...n,nowIso:new Date().toISOString()});return qi.set(t,o),qe(o)},getFinancialSnapshot(e=!1,t="all"){return this.computeFinanceContext(e,t).snapshot},getFinancialReadModel(e=!1,t="all"){return this.computeFinanceContext(e,t).readModel},saveProjectProfile(e){const t=String(e.name||"").trim();if(!t)throw new Error("Add a project plan name.");const n=(this.getFinancialReadModel().projectProfiles||[]).find(m=>String(m.id||"")===String(e.id||"")),r=String(e.id||n?.id||nn("project")),o=new Date().toISOString(),c=this.getFinanceSettings().baseCurrency,u=this.appendFinanceEvent({type:"project.profile_set",amount:0,currency:c,timestamp:Ee(r),related_entity_id:r,metadata:{name:t,clientOrPurpose:String(e.clientOrPurpose||"").trim(),color:String(e.color||n?.color||"mint"),notes:String(e.notes||"").trim(),status:e.status==="archived"?"archived":"active",createdAt:String(n?.createdAt||o)}},{source:"saveProjectProfile"});return u?[u]:[]},archiveProjectProfile(e){const t=(this.getFinancialReadModel().projectProfiles||[]).find(n=>String(n.id||"")===String(e||""));if(!t)throw new Error("This project plan could not be found.");return this.saveProjectProfile({id:String(t.id),name:String(t.name||"Project plan"),clientOrPurpose:String(t.clientOrPurpose||""),color:String(t.color||"mint"),notes:String(t.notes||""),status:"archived"})},appendFinanceEvent(e,t={}){return this.appendFinanceEvents([e],t)[0]||null},appendFinanceEvents(e,t={}){if(!e.length)return[];if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),r=this.getFinanceSettings(),o=new Map;Mn().forEach(m=>{const f=String(m.related_entity_id||m.metadata?.entity_id||"").trim(),y=Date.parse(String(m.timestamp||""));!f||!Number.isFinite(y)||o.set(f,Math.max(o.get(f)||0,y))});const c=e.map(m=>{const f=String(m.related_entity_id||m.metadata?.entity_id||"").trim();if(!f)return m;const y=Date.parse(String(m.timestamp||"")),h=o.get(f)||0,b=Math.max(Number.isFinite(y)?y:Date.parse(n),h+1);return o.set(f,b),b===y?m:{...m,timestamp:new Date(b).toISOString()}}),u=window.FinanceLedger.appendEvents(Mn(),c,{...r,nowIso:n},{nowIso:n,allowApproximateTimestamp:!1});return ga(u.events),Xt(this.getFinancialSnapshot(!0),String(t.source||"appendFinanceEvents")),qe(u.appended)},reverseFinanceEvent(e,t="undo"){if(!window.FinanceLedger?.reverseEvent)throw new Error("Finance ledger module is unavailable.");const n=new Date().toISOString(),r=this.getFinanceSettings(),o=window.FinanceLedger.reverseEvent(Mn(),e,t,{...r,nowIso:n},{nowIso:n});return ga(o.events),Xt(this.getFinancialSnapshot(!0),"reverseFinanceEvent"),qe(o.appended[0]||null)},reverseTransaction(e,t="ledger.transaction.reverse"){const n=(this.getFinancialReadModel().transactions||[]).find(f=>String(f.id)===String(e||"")||String(f.transactionEntityId||"")===String(e||""));if(!n)throw new Error("This transaction could not be found.");const r=String(n.id),o=String(n.transactionEntityId||""),c=this.getFinanceSettings().baseCurrency,u=Ee(o||r),m=this.getActiveFinanceEvents().filter(f=>String(f.id)===r||!!o&&String(f.metadata?.transactionId||"")===o).map(f=>({type:"finance.event_reversed",amount:0,currency:f.currency||c,timestamp:u,related_entity_id:f.id,metadata:{entity_id:o||r,reason:t,reversed_event_id:f.id}}));return m.length?this.appendFinanceEvents(m,{source:"reverseTransaction"}):[]},recordTransaction(e){const t=(this.getFinancialReadModel().fiatAccounts||[]).find(y=>String(y.id)===String(e.accountId||"")),n=Number(e.amount);if(!t)throw new Error("Choose a cash account before saving this transaction.");if(!Number.isFinite(n)||n===0)throw new Error("Transaction amount must be non-zero.");const r=this.getFinanceSettings().baseCurrency,o=Ee(`transaction-${e.accountId}`,e.timestamp),c=nn("transaction"),u=De(e.scope,De(t.scope)),m=Math.round(((Number(t.balance)||0)+n)*100)/100,f={accountId:String(t.id),accountName:String(t.name||"Account"),categoryId:String(e.categoryId||"uncategorized"),scope:u,source:String(e.source||"manual"),importBatchId:e.importBatchId||void 0,fingerprint:e.fingerprint||void 0,sourceFile:e.sourceFile||void 0,obligationId:e.obligationId||void 0,obligationDueDate:e.obligationDueDate||void 0,obligationTitle:e.obligationTitle||void 0,projectId:at(e.projectId||t.projectId)||void 0};return this.appendFinanceEvents([{type:n>0?"income.received":"expense.recorded",amount:Math.abs(n),currency:r,timestamp:o,related_entity_id:c,metadata:{...f,description:e.description}},{type:"asset.account_set",amount:m,currency:r,timestamp:Ee(String(t.id),o),related_entity_id:String(t.id),metadata:{name:t.name,balance:m,active:!0,scope:u,bucket:t.bucket,reserved:t.reserved,projectId:at(e.projectId||t.projectId)||void 0,transactionId:c,source:f.source,importBatchId:f.importBatchId}}],{source:e.source||"recordTransaction"})},recordLedgerTransaction(e){const t=String(e.type||"").toLowerCase(),n=Math.abs(Number(e.amount));if(!["income","expense","adjustment"].includes(t))throw new Error("Choose income, expense, or adjustment.");if(!Number.isFinite(n)||n<=0)throw new Error("Transaction amount must be positive.");const o=this.getFinancialReadModel().fiatAccounts||[],c=String(e.accountId||""),u=De(e.scope,"business");if(!c&&o.length===0){const q=this.getFinanceSettings().baseCurrency,H=Ee("first-transaction-account",e.timestamp),fe=Sc({currency:q,timestamp:H,scope:u}),J=String(fe.related_entity_id||""),K=t==="income"?n:t==="expense"||e.direction==="decrease"?-n:n,W=e.categoryId||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),re=nn(t==="adjustment"?"adjustment":"transaction"),le=at(e.projectId),Ne={type:t==="income"?"income.received":t==="expense"?"expense.recorded":"cash.adjusted",amount:n,currency:q,timestamp:Ee(re,H),related_entity_id:re,metadata:{ledgerType:t==="adjustment"?"adjustment":void 0,direction:t==="adjustment"?e.direction==="decrease"?"decrease":"increase":void 0,description:e.description,accountId:J,accountName:"Operating cash",categoryId:W,scope:u,projectId:le||void 0,source:"manual-ledger"}},Ae={type:"asset.account_set",amount:K,currency:q,timestamp:Ee(J,H),related_entity_id:J,metadata:{name:"Operating cash",balance:K,active:!0,scope:u,projectId:le||void 0,bucket:"available",reserved:!1,transactionId:re,source:"manual-ledger"}};return this.appendFinanceEvents([fe,Ne,Ae],{source:"recordLedgerTransaction.firstAccount"})}if(t==="income")return this.recordTransaction({description:e.description,amount:n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"client-income",scope:e.scope,projectId:e.projectId,source:"manual-ledger"});if(t==="expense")return this.recordTransaction({description:e.description,amount:-n,timestamp:e.timestamp,accountId:e.accountId,categoryId:e.categoryId||"uncategorized",scope:e.scope,projectId:e.projectId,source:"manual-ledger"});const m=(this.getFinancialReadModel().fiatAccounts||[]).find(q=>String(q.id)===String(e.accountId||""));if(!m)throw new Error("Choose a cash account before saving this adjustment.");const f=e.direction==="decrease"?"decrease":"increase",y=f==="decrease"?-n:n,h=this.getFinanceSettings().baseCurrency,b=Ee(`adjustment-${e.accountId}`,e.timestamp),_=nn("adjustment"),B=De(e.scope,De(m.scope)),N=at(e.projectId||m.projectId),x=Math.round(((Number(m.balance)||0)+y)*100)/100;return this.appendFinanceEvents([{type:"cash.adjusted",amount:n,currency:h,timestamp:b,related_entity_id:_,metadata:{ledgerType:"adjustment",direction:f,description:e.description,accountId:String(m.id),accountName:String(m.name||"Account"),categoryId:String(e.categoryId||"adjustment"),scope:B,projectId:N||void 0,source:"manual-ledger"}},{type:"asset.account_set",amount:x,currency:h,timestamp:Ee(String(m.id),b),related_entity_id:String(m.id),metadata:{name:m.name,balance:x,active:!0,scope:De(m.scope),projectId:N||void 0,bucket:m.bucket,reserved:m.reserved,transactionId:_,source:"manual-ledger"}}],{source:"recordLedgerTransaction.adjustment"})},recordTransfer(e){const t=this.getFinancialReadModel(),n=(t.fiatAccounts||[]).find(_=>String(_.id)===String(e.fromAccountId||"")),r=(t.fiatAccounts||[]).find(_=>String(_.id)===String(e.toAccountId||"")),o=Math.abs(Number(e.amount));if(!n||!r)throw new Error("Choose both transfer accounts.");if(String(n.id)===String(r.id))throw new Error("Transfer accounts must be different.");if(!Number.isFinite(o)||o<=0)throw new Error("Transfer amount must be positive.");const c=this.getFinanceSettings().baseCurrency,u=Ee(`transfer-${n.id}-${r.id}`,e.timestamp),m=nn("transfer"),f=De(e.scope,De(n.scope)),y=at(e.projectId||n.projectId||r.projectId),h=Math.round(((Number(n.balance)||0)-o)*100)/100,b=Math.round(((Number(r.balance)||0)+o)*100)/100;return this.appendFinanceEvents([{type:"transfer.recorded",amount:o,currency:c,timestamp:u,related_entity_id:m,metadata:{ledgerType:"transfer",direction:"transfer",description:e.description||`Transfer from ${String(n.name||"account")} to ${String(r.name||"account")}`,fromAccountId:String(n.id),fromAccountName:String(n.name||"From account"),toAccountId:String(r.id),toAccountName:String(r.name||"To account"),accountId:String(n.id),accountName:String(n.name||"From account"),categoryId:String(e.categoryId||"transfer"),scope:f,projectId:y||void 0,source:"manual-ledger"}},{type:"asset.account_set",amount:h,currency:c,timestamp:Ee(String(n.id),u),related_entity_id:String(n.id),metadata:{name:n.name,balance:h,active:!0,scope:De(n.scope),projectId:at(n.projectId)||void 0,bucket:n.bucket,reserved:n.reserved,transactionId:m,source:"manual-ledger"}},{type:"asset.account_set",amount:b,currency:c,timestamp:Ee(String(r.id),u),related_entity_id:String(r.id),metadata:{name:r.name,balance:b,active:!0,scope:De(r.scope),projectId:at(r.projectId)||void 0,bucket:r.bucket,reserved:r.reserved,transactionId:m,source:"manual-ledger"}}],{source:"recordTransfer"})},reviewObligation(e){const n=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(_=>String(_.id||"")===String(e.id||""));if(!n)throw new Error("This obligation could not be found.");const r=e.status;if(r!=="paid"&&r!=="deferred"&&r!=="needs_review")throw new Error("Choose a valid obligation status.");const o=this.getFinanceSettings().baseCurrency,c=Math.abs(Number(e.amount??n.amount));if(!Number.isFinite(c)||c<=0)throw new Error("Obligation amount must be positive.");let u="",m="",f="";const y=De(n.scope);if(r==="paid"){if(!e.accountId)throw new Error("Choose the account that paid this obligation.");const _=(this.getFinancialReadModel().fiatAccounts||[]).find(N=>String(N.id)===String(e.accountId));if(!_)throw new Error("Choose a valid payment account.");m=String(_.id),f=String(_.name||"Account");const B=this.recordTransaction({description:`Paid ${String(n.title||"obligation")}`,amount:-c,timestamp:fa(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)),accountId:m,categoryId:"obligation",scope:y,source:"obligation.review",obligationId:String(n.id),obligationDueDate:String(n.dueDate||""),obligationTitle:String(n.title||"Obligation"),projectId:at(n.projectId)||void 0});u=String(B[0]?.related_entity_id||B[0]?.id||"")}if(r==="deferred"&&!e.deferredUntil)throw new Error("Choose a new due date for this deferred obligation.");const h=Ee(String(e.id)),b=this.appendFinanceEvent({type:"obligation.reviewed",amount:c,currency:o,timestamp:h,related_entity_id:String(e.id),metadata:{status:r,title:String(n.title||"Obligation"),dueDate:String(n.dueDate||""),originalDueDate:String(n.originalDueDate||n.dueDate||""),paidAt:r==="paid"?fa(String(e.paidAt||n.dueDate||new Date().toISOString()).slice(0,10)):void 0,deferredUntil:r==="deferred"?e.deferredUntil:void 0,accountId:m,accountName:f,transactionId:u,scope:y,projectId:at(n.projectId)||void 0,notes:e.notes||""}},{source:"reviewObligation"});return b?[b]:[]},reviewTransaction(e){const t=this.getFinancialReadModel(),n=(t.transactions||[]).find(y=>String(y.id)===String(e.id||"")||String(y.transactionEntityId||"")===String(e.id||""));if(!n)throw new Error("This transaction could not be found.");const r=String(e.categoryId||"").trim();if(!r)throw new Error("Choose a category for this transaction.");const o=this.getFinanceSettings().baseCurrency,c=String(n.id||e.id),u=at(e.projectId??n.projectId),m=this.appendFinanceEvents([{type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:o,timestamp:Ee(c),related_entity_id:c,metadata:{categoryId:r,scope:De(e.scope,De(n.scope)),reviewStatus:"reviewed",notes:String(e.notes||""),linkedIncomeId:String(e.linkedIncomeId||"").trim(),linkedReserveId:String(e.linkedReserveId||"").trim(),linkedDebtId:String(e.linkedDebtId||"").trim(),projectId:u||void 0}}],{source:"reviewTransaction"}),f=String(e.linkedIncomeId||"").trim();if(f&&String(n.type)==="income.received"){const y=(t.pipelineDeals||[]).find(h=>String(h.id||"")===f);y&&m.push(...this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:Number(y.value)||Math.abs(Number(n.amount)||0),currency:o,timestamp:Ee(f),related_entity_id:f,metadata:{title:String(y.title||"Income"),status:"paid",stage:"paid",probability:1,expectedDateISO:String(n.timestamp||new Date().toISOString()).slice(0,10),destinationAccountId:String(n.accountId||""),destinationAccountName:String(n.accountName||""),linkedTransactionId:c,incomeType:String(y.incomeType||"one_off"),notes:String(e.notes||""),scope:De(e.scope,De(n.scope)),projectId:u||at(y.projectId)||void 0}}],{source:"reviewTransaction.linkIncome"}))}return m},matchTransactionToObligation(e){const n=(this.getFinancialReadModel().transactions||[]).find(h=>String(h.id)===String(e.transactionId||"")||String(h.transactionEntityId||"")===String(e.transactionId||""));if(!n)throw new Error("This payment could not be found.");if(String(n.type)!=="expense.recorded")throw new Error("Only expense payments can be matched to obligations.");const o=((this.computeFinanceContext(!0).treasury||{}).obligations||[]).find(h=>String(h.id||"")===String(e.obligationId||""));if(!o)throw new Error("Choose an obligation to match this payment to.");const c=this.getFinanceSettings().baseCurrency,u=String(n.id||e.transactionId),m=De(o.scope,De(n.scope)),f=at(n.projectId||o.projectId),y=Ee(String(o.id));return this.appendFinanceEvents([{type:"transaction.reviewed",amount:Math.abs(Number(n.amount)||0),currency:c,timestamp:y,related_entity_id:u,metadata:{categoryId:"obligation",scope:De(n.scope),reviewStatus:"reviewed",obligationId:String(o.id),obligationTitle:String(o.title||"Obligation"),projectId:f||void 0,notes:String(e.notes||"")}},{type:"obligation.reviewed",amount:Math.abs(Number(n.amount)||Number(o.amount)||0),currency:c,timestamp:Ee(String(o.id),y),related_entity_id:String(o.id),metadata:{status:"paid",title:String(o.title||"Obligation"),dueDate:String(o.dueDate||""),originalDueDate:String(o.originalDueDate||o.dueDate||""),paidAt:String(n.timestamp||new Date().toISOString()),accountId:String(n.accountId||""),accountName:String(n.accountName||""),transactionId:u,scope:m,projectId:f||void 0,notes:String(e.notes||"")}}],{source:"matchTransactionToObligation"})},updatePipelineReview(e){const t=this.getFinancialReadModel(),n=(t.pipelineDeals||[]).find(y=>String(y.id)===String(e.id||""));if(!n)throw new Error("This pipeline item could not be found.");const r=String(e.status||"").toLowerCase();if(!["lead","proposal","expected","confirmed","invoiced","due","overdue","risky","paid","cancelled","lost"].includes(r))throw new Error("Choose a supported income status.");const o=Number(e.probability);if(!Number.isFinite(o)||o<0||o>1)throw new Error("Probability must be between 0 and 1.");const c=window.FinanceDates?.toDateOnly?.(e.expectedDateISO)||"";if(!c)throw new Error("Choose a valid expected date.");const u=(t.fiatAccounts||[]).find(y=>String(y.id)===String(e.destinationAccountId||"")),m=this.getFinanceSettings().baseCurrency,f=Ee(String(n.id));return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:m,timestamp:f,related_entity_id:String(n.id),metadata:{stage:r,status:r,title:n.title,scope:De(n.scope),projectId:at(n.projectId)||void 0,expectedDateISO:c,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:u?String(u.name||""):"",notes:String(e.notes||"")}},{type:"pipeline.probability_changed",amount:o,currency:m,timestamp:Ee(String(n.id),f),related_entity_id:String(n.id),metadata:{probability:o,scope:De(n.scope),projectId:at(n.projectId)||void 0,expectedDateISO:c,destinationAccountId:String(e.destinationAccountId||""),destinationAccountName:u?String(u.name||""):"",notes:String(e.notes||"")}}],{source:"updatePipelineReview"})},cancelPipelineItem(e,t=""){const n=(this.getFinancialReadModel().pipelineDeals||[]).find(o=>String(o.id)===String(e||""));if(!n)throw new Error("This pipeline item could not be found.");const r=this.getFinanceSettings().baseCurrency;return this.appendFinanceEvents([{type:"pipeline.stage_changed",amount:0,currency:r,timestamp:Ee(String(n.id)),related_entity_id:String(n.id),metadata:{stage:"cancelled",status:"cancelled",title:n.title,scope:De(n.scope),projectId:at(n.projectId)||void 0,notes:t}}],{source:"cancelPipelineItem"})},saveDebtPlan(e){const t=(this.getFinancialReadModel().debtAccounts||[]).find(_=>String(_.id)===String(e.id||""));if(!t)throw new Error("This debt item could not be found.");const n=String(e.planStatus||t.planStatus||"").trim().toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_"),r=["active","on_hold","starts_later","irregular","completed","archived","missing"].includes(n)?n:Number(t.monthlyPressure||t.minimumPaymentMonthly||t.minimumPayment)>0?"active":"missing";let o=window.FinanceDates?.toDateOnly?.(e.dueDate||t.dueDate)||"",c=Math.abs(Number(e.minimumPayment));Number.isFinite(c)||(c=Math.abs(Number(t.paymentAmount||t.minimumPayment)||0));const u=e.planType||"regular",m=window.FinanceDates?.toDateOnly?.(e.startDate||t.startDate||"")||"",f=window.FinanceDates?.toDateOnly?.(e.endDate||t.endDate||"")||"",y=Number.isFinite(Number(e.customMonthlyPressure))?Math.max(0,Number(e.customMonthlyPressure)):Number.isFinite(Number(t.customMonthlyPressure))?Math.max(0,Number(t.customMonthlyPressure)):null;if(r==="starts_later"&&!m)throw new Error("Choose when this payment plan starts.");if(u==="custom"&&r==="active"){const _=Array.isArray(e.installments)?e.installments:[];if(!_.length)throw new Error("Add at least one installment for a custom plan.");const B=[..._].sort((N,x)=>N.date.localeCompare(x.date));o=window.FinanceDates?.toDateOnly?.(B[0].date)||o,c=Math.abs(Number(B[0].amount))||0}else if(r==="active"){if(!o)throw new Error("Choose a debt due date.");if(!Number.isFinite(c)||c<=0)throw new Error("Add a positive minimum payment.")}const h=this.getFinanceSettings().baseCurrency,b=this.appendFinanceEvent({type:"debt.plan_updated",amount:c,currency:h,timestamp:Ee(String(t.id)),related_entity_id:String(t.id),metadata:{name:t.name,scope:De(t.scope),projectId:at(t.projectId)||void 0,dueDate:o,minimumPayment:c,paymentAmount:c,paymentPlanNote:String(e.paymentPlanNote||"").trim(),planType:u,planStatus:r,startDate:m,endDate:f,customMonthlyPressure:y,includeInBurnRate:e.includeInBurnRate!==!1,includeInSafeToSpend:e.includeInSafeToSpend!==!1,includeInRunway:e.includeInRunway!==!1,frequency:String(e.frequency||"monthly"),paymentFrequency:String(e.frequency||"monthly"),installments:e.installments||[]}},{source:"saveDebtPlan"});return b?[b]:[]},setDebtPlanStatus(e,t){const n=(this.getFinancialReadModel().debtAccounts||[]).find(r=>String(r.id)===String(e||""));if(!n)throw new Error("This debt item could not be found.");return this.saveDebtPlan({id:String(n.id),dueDate:String(n.dueDate||""),minimumPayment:Number(n.paymentAmount||n.minimumPayment||0),paymentPlanNote:String(n.paymentPlanNote||""),planType:String(n.planType||"regular")==="custom"?"custom":"regular",planStatus:t,startDate:String(n.startDate||""),endDate:String(n.endDate||""),customMonthlyPressure:Number.isFinite(Number(n.customMonthlyPressure))?Number(n.customMonthlyPressure):null,frequency:String(n.paymentFrequency||n.frequency||"monthly"),installments:Array.isArray(n.installments)?n.installments:[],includeInBurnRate:n.includeInBurnRate!==!1,includeInSafeToSpend:n.includeInSafeToSpend!==!1,includeInRunway:n.includeInRunway!==!1})},deactivateFiatAccount(e){return _n(e,["asset.account_set"],"deactivateFiatAccount",t=>{const n=t.metadata||{};return String(t.related_entity_id||"")===e||String(n.accountId||"")===e})},deactivateReserveBucket(e){return _n(e,["asset.reserve_set","asset.reserve_allocated"],"deactivateReserveBucket",t=>{const n=t.metadata||{};return String(t.related_entity_id||"")===e||String(n.reserveId||"")===e})},deactivateRecurringExpense(e){return _n(e,["expense.recurring_set"],"deactivateRecurringExpense")},deactivateWeb3Position(e){return _n(e,["asset.position_set"],"deactivateWeb3Position")},deactivateDefiPosition(e){return _n(e,["asset.defi_set"],"deactivateDefiPosition")},deactivateDebtAccount(e){return _n(e,["debt.added","debt.payment_made"],"deactivateDebtAccount")},deleteDebtAccount(e){return _n(e,["debt.added","debt.payment_made","debt.plan_updated"],"deleteDebtAccount")},markPipelineItemPaid(e,t={}){const n=this.getFinancialReadModel(),r=(n.pipelineDeals||[]).find(h=>String(h.id)===e);if(!r||String(r.status).toLowerCase()==="paid")return[];const o=this.getFinanceSettings().baseCurrency,c=Ee(e,t.timestamp),u=Math.abs(Number(r.value)||0),m=String(t.destinationAccountId||r.destinationAccountId||""),f=(n.fiatAccounts||[]).find(h=>String(h.id)===m);if(!f)throw new Error("Choose a settlement account before marking this pipeline item as paid.");const y=[{type:"pipeline.stage_changed",amount:0,currency:o,timestamp:c,related_entity_id:e,metadata:{stage:"paid",status:"paid",title:r.title,scope:De(r.scope)}},{type:"invoice.paid",amount:u,currency:o,timestamp:c,related_entity_id:e,metadata:{client:r.title,amount:u,expectedDate:r.expectedDateISO,destinationAccountId:m,scope:De(r.scope)}},{type:"income.received",amount:u,currency:o,timestamp:c,related_entity_id:e,metadata:{description:`Invoice paid: ${String(r.title||"Invoice")}`,invoiceId:e,destinationAccountId:m,accountId:m,accountName:f.name,categoryId:"client-income",scope:De(r.scope),source:"pipeline-settlement"}}];if(f){const h=Math.round(((Number(f.balance)||0)+u)*100)/100;y.push({type:"asset.account_set",amount:h,currency:o,timestamp:Ee(String(f.id),c),related_entity_id:String(f.id),metadata:{name:f.name,balance:h,active:!0,scope:De(f.scope),bucket:f.bucket,reserved:f.reserved,invoiceId:e,settlementTransfer:!0}})}return this.appendFinanceEvents(y,{source:"markPipelineItemPaid"})},getReviewState(){return $a(vn(ae.review,er))},completeWeeklyReview(e={}){const n=this.getFinancialReadModel().fiatAccounts||[],r=Array.isArray(e.accounts)?e.accounts:n.map(_=>({accountId:String(_.id),balance:Number(_.balance)||0}));if(r.some(_=>!String(_.accountId||"").trim()||!Number.isFinite(Number(_.balance))))throw new Error("Each reconciled account needs a valid balance.");const o=new Date().toISOString(),c=this.getFinanceSettings().baseCurrency,u=r.flatMap(_=>{const B=n.find(x=>String(x.id)===String(_.accountId)),N=Number(_.balance);return!B||!Number.isFinite(N)||N===Number(B.balance)?[]:[{type:"asset.account_set",amount:N,currency:c,timestamp:Ee(String(B.id),o),related_entity_id:String(B.id),metadata:{name:B.name,balance:N,active:!0,scope:De(B.scope),bucket:B.bucket,reserved:B.reserved,source:"weekly-review-reconciliation"}}]});u.length&&this.appendFinanceEvents(u,{source:"completeWeeklyReview.reconcile"});const m=this.computeFinanceContext(!0),f=Hi({readModel:m.readModel,snapshot:m.snapshot,treasury:m.treasury,nowIso:o}),y=Ar({readModel:m.readModel,snapshot:m.snapshot,treasury:m.treasury,reviewQueue:m.treasury?.reviewQueue||[],forecast:f,nowIso:o}),h={unresolvedItems:e.unresolvedItems!==!1,matchPayments:e.matchPayments!==!1,confirmObligations:e.confirmObligations!==!1,reviewSignals:e.reviewSignals!==!1,closeMonth:e.closeMonth!==!1},b=tc({previousReview:this.getReviewState(),summary:y,accounts:r,checklist:h,nowIso:o,notes:e.notes,chosenFocus:e.chosenFocus});return Oe(ae.review,b),Xt(this.getFinancialSnapshot(!0),"completeWeeklyReview"),b},getGoals(){return Ir(vn(ae.goals,tr))},getSavedScenarios(){return yc(vn(ae.scenarios,ar))},saveScenario(e){const t=this.getSavedScenarios(),n=new Date().toISOString(),r=String(e.id||nn("scenario")),o=t.scenarios.find(m=>m.id===r),c={id:r,name:String(e.name||o?.name||"Saved scenario").trim()||"Saved scenario",type:Fr(e.type),amount:Math.max(0,Number(e.amount)||0),protectPercent:Number.isFinite(Number(e.protectPercent))?Math.max(0,Math.min(100,Number(e.protectPercent))):o?.protectPercent,createdAt:o?.createdAt||n,updatedAt:n},u=[c,...t.scenarios.filter(m=>m.id!==r)].slice(0,24);return Oe(ae.scenarios,{scenarios:u,selectedScenarioId:c.id}),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:qe(this.getUiSettings())})),c},deleteScenario(e){const t=this.getSavedScenarios(),n=t.scenarios.filter(c=>c.id!==String(e||"")),r=t.selectedScenarioId===String(e||"")?n[0]?.id:t.selectedScenarioId,o={scenarios:n,...r?{selectedScenarioId:r}:{}};return Oe(ae.scenarios,o),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:qe(this.getUiSettings())})),o},getGoalProgress(e="all"){return nc(this.getGoals(),this.getFinancialReadModel(!1,"all").fiatAccounts||[],e)},saveGoal(e){const t=this.getGoals(),n=t.goals.find(u=>u.id===e.id),r=new Date().toISOString(),o=Number(e.targetAmount);if(!String(e.name||"").trim())throw new Error("Add a name for this goal.");if(!Number.isFinite(o)||o<=0)throw new Error("Goal target must be greater than zero.");const c={id:n?.id||nn("goal"),name:String(e.name).trim(),type:e.type==="savings"?"savings":"buffer",targetAmount:o,targetDate:/^\d{4}-\d{2}-\d{2}$/.test(String(e.targetDate||""))?e.targetDate:void 0,scope:De(e.scope,n?.scope||"shared"),linkedAccountIds:Array.isArray(e.linkedAccountIds)?e.linkedAccountIds.map(String).filter(Boolean):[],createdAt:n?.createdAt||r,updatedAt:r};return t.goals=n?t.goals.map(u=>u.id===c.id?c:u):[...t.goals,c],Oe(ae.goals,t),Xt(this.getFinancialSnapshot(!0),"saveGoal"),qe(c)},deleteGoal(e){const t=this.getGoals();return t.goals=t.goals.filter(n=>n.id!==String(e)),Oe(ae.goals,t),Xt(this.getFinancialSnapshot(!0),"deleteGoal"),qe(t)},getImportState(){return bc(vn(ae.imports,nr))},saveCsvImportProfile(e){const t=Array.isArray(e.headers)?e.headers.map(String).filter(Boolean):[],n=Aa(t);if(!n)throw new Error("CSV profile needs detected headers.");const r=new Date().toISOString(),o=this.getImportState(),c=o.profiles.find(m=>Aa(m.headers)===n),u={id:c?.id||nn("import-profile"),name:String(e.name||e.sourceFile||c?.name||"CSV mapping").trim()||"CSV mapping",headers:t,mapping:kr(e.mapping),accountId:String(e.accountId||c?.accountId||"")||void 0,defaultCategory:String(e.defaultCategory||c?.defaultCategory||"uncategorized").trim()||"uncategorized",defaultScope:De(e.defaultScope,c?.defaultScope||"business"),createdAt:c?.createdAt||r,updatedAt:r};return o.profiles=c?o.profiles.map(m=>m.id===c.id?u:m):[u,...o.profiles].slice(0,8),o.lastProfileId=u.id,Oe(ae.imports,o),qe(u)},renameCsvImportProfile(e,t){const n=this.getImportState(),r=String(e||"").trim(),o=String(t||"").trim();if(!r)throw new Error("Choose a saved CSV profile.");if(!o)throw new Error("CSV profile name cannot be empty.");const c=n.profiles.find(m=>m.id===r);if(!c)throw new Error("Saved CSV profile was not found.");const u={...c,name:o,updatedAt:new Date().toISOString()};return n.profiles=n.profiles.map(m=>m.id===r?u:m),Oe(ae.imports,n),qe(u)},deleteCsvImportProfile(e){const t=this.getImportState(),n=String(e||"").trim();if(!n)throw new Error("Choose a saved CSV profile.");return t.profiles=t.profiles.filter(r=>r.id!==n),t.lastProfileId===n&&delete t.lastProfileId,Oe(ae.imports,t),qe(t)},importCsvTransactions(e,t){const n=String(t.sourceFile||"pasted-transactions.csv"),r=t.duplicatePolicy==="import"?"import":"skip",o=new Set(this.getActiveFinanceEvents().map(N=>String(N.metadata?.fingerprint||"")).filter(Boolean)),c=nn("import");let u=0,m=0,f=0;const y=[];e.forEach(N=>{const x=o.has(N.fingerprint);if(x&&r!=="import"){m+=1;return}o.add(N.fingerprint),y.push(N.fingerprint),x&&(f+=1),this.recordTransaction({description:N.description,amount:N.amount,timestamp:fa(N.date),accountId:t.accountId,categoryId:N.categoryId,scope:N.scope,source:"csv-import",importBatchId:c,fingerprint:N.fingerprint,sourceFile:n}),u+=1});const h=e.map(N=>String(N.date||"")).filter(N=>/^\d{4}-\d{2}-\d{2}$/.test(N)).sort(),b=e.reduce((N,x)=>N+(Number(x.amount)>0?Number(x.amount):0),0),_=e.reduce((N,x)=>N+(Number(x.amount)<0?Math.abs(Number(x.amount)):0),0),B=this.getImportState();return B.batches.push({id:c,importedAt:new Date().toISOString(),sourceFile:n,fingerprints:y,accountId:t.accountId,importedCount:u,duplicateCount:Number(t.duplicateCount||0)+m,duplicateImportedCount:f,rejectedCount:Number(t.rejectedCount||0),duplicatePolicy:r,incomeTotal:Math.round(b*100)/100,expenseTotal:Math.round(_*100)/100,dateFrom:h[0],dateTo:h[h.length-1]}),Oe(ae.imports,B),{batchId:c,imported:u,duplicates:m,duplicateImported:f}},exportTransactionsCsv(){const e=["date","description","amount","direction","type","account","accountId","category","scope","reviewStatus","linkedObligationId","linkedIncomeId","source"],t=(this.getFinancialReadModel().transactions||[]).map(n=>{const r=Number(n.signedAmount??n.amount)||0;return[Ic(n.timestamp),n.description,r,n.direction||(r<0?"out":"in"),n.ledgerType||n.type,n.accountName||n.fromAccountName||"",n.accountId||n.fromAccountId||"",n.categoryId,n.scope,n.reviewStatus,n.obligationId,n.linkedIncomeId,n.source].map($c).join(",")});return[e.join(","),...t].join(`
`)},undoImportBatch(e){const t=this.getFinanceSettings().baseCurrency,n=this.getActiveFinanceEvents().filter(r=>String(r.metadata?.importBatchId||"")===String(e)).map(r=>({type:"finance.event_reversed",amount:0,currency:r.currency||t,timestamp:Ee(String(r.related_entity_id||r.id)),related_entity_id:r.id,metadata:{reason:"undoImportBatch",reversed_event_id:r.id,importBatchId:e}}));return n.length?this.appendFinanceEvents(n,{source:"undoImportBatch"}):[]},getPriceCache(){return vn(ae.priceCache,ir)},async refreshCryptoPrices(){const e=this.getUiSettings(),t=zs(e.walletPriceSource),n=(this.getFinancialReadModel().web3Positions||[]).filter(y=>y.manualPriceOverride!==!0);if(!n.length||t.id==="manual")return{updated:0,source:t.id};const r=n.map(y=>String(y.symbolOrName||"")).filter(Boolean);let o;try{o=await t.getQuotes(r,this.getFinanceSettings().baseCurrency)}catch(y){return{updated:0,source:t.id,error:y instanceof Error?y.message:"Price refresh failed."}}const c=new Map(o.map(y=>[y.symbol.toUpperCase(),y])),u=this.getFinanceSettings().baseCurrency,m=n.flatMap(y=>{const h=c.get(String(y.symbolOrName||"").toUpperCase());return h?[{type:"asset.position_set",amount:0,currency:u,timestamp:new Date().toISOString(),related_entity_id:String(y.id),metadata:{symbolOrName:y.symbolOrName,chain:y.chain,amount:y.amount,price:h.price,liquidity:y.liquidity,scope:De(y.scope),priceSource:h.source,priceUpdatedAt:h.quotedAt,manualPriceOverride:!1}}]:[]}),f=this.getPriceCache();return o.forEach(y=>{f.quotes[y.symbol.toUpperCase()]=y}),Oe(ae.priceCache,f),m.length&&this.appendFinanceEvents(m,{source:"refreshCryptoPrices"}),{updated:m.length,source:t.id}},exportBackup(){const e=new Date().toISOString(),t={version:Sa,exportedAt:e,ledger:this.getFinanceLedger(),financeSettings:this.getFinanceSettings(),uiSettings:this.getUiSettings(),review:this.getReviewState(),goals:this.getGoals(),imports:this.getImportState(),scenarios:this.getSavedScenarios(),prices:this.getPriceCache()};return{...t,metadata:wr(t,pn,wa)}},recordBackupExport(e=new Date().toISOString()){Oe(ae.backupMeta,{lastBackupAt:e})},previewBackup(e){return Ea(e,{latestLocalEventAt:this.getLocalDataHealth().latestEventAt})},restoreBackup(e){const t=Qs(e);return Oe(ae.ledger,t.ledger),Oe(ae.settings,t.financeSettings||yi),Oe(ae.ui,t.uiSettings||pa),Oe(ae.review,t.review||er),Oe(ae.goals,t.goals||tr),Oe(ae.imports,t.imports||nr),Oe(ae.scenarios,t.scenarios||ar),Oe(ae.priceCache,t.prices||ir),ri(ae.demoSeed,"restored-backup"),oi(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:qe(this.getUiSettings())})),Xt(this.getFinancialSnapshot(!0),"restoreBackup"),this.exportBackup()},getLocalDataHealth(){const e=vn(ae.backupMeta,vc);return{...Ps({ledger:rt(ae.ledger),settings:rt(ae.settings),ui:rt(ae.ui),review:rt(ae.review),goals:rt(ae.goals),imports:rt(ae.imports),scenarios:rt(ae.scenarios),priceCache:rt(ae.priceCache)}),...rr,schemaLabel:pn,backupVersion:Sa,lastBackupAt:typeof e.lastBackupAt=="string"?e.lastBackupAt:null,migrationStatus:or,storageKeys:[...Ka]}},resetLocalFinanceData(){return Ka.forEach(e=>Oi(e)),ri(ae.demoSeed,"deleted"),oi(),window.dispatchEvent(new CustomEvent("finance:ui-updated",{detail:qe(this.getUiSettings())})),Xt(this.getFinancialSnapshot(!0),"resetLocalFinanceData"),this.getLocalDataHealth()},deleteInvoice(e,t={}){const n=this.getFinanceSettings().baseCurrency,r=Ee(e,t.timestamp),o=[];return t.reverseSettlement===!0&&this.getActiveFinanceEvents().filter(c=>{const u=c.metadata||{};return String(c.related_entity_id||"")===e||String(u.invoiceId||"")===e}).filter(c=>["invoice.paid","income.received","asset.account_set"].includes(c.type)).forEach(c=>o.push({type:"finance.event_reversed",amount:0,currency:c.currency||n,timestamp:r,related_entity_id:c.id,metadata:{reason:"deleteInvoice",reversed_event_id:c.id,entity_id:e}})),o.push({type:"pipeline.stage_changed",amount:0,currency:n,timestamp:r,related_entity_id:e,metadata:{stage:"cancelled",status:"cancelled"}}),this.appendFinanceEvents(o,{source:"deleteInvoice"})},seedDemoIfNeeded(e=!1){const t=Mn(),n=String(Vi(ae.demoSeed,"")||"");if(!e&&t.length>0){n||ri(ae.demoSeed,"existing-ledger");return}if(!e&&["deleted","restored-backup","existing-ledger","empty-setup"].includes(n))return;const r=this.getFinanceSettings().baseCurrency,o=new Date().toISOString(),c=ys(r);if(!window.FinanceLedger?.appendEvents)throw new Error("Finance ledger module is unavailable.");const u=window.FinanceLedger.appendEvents([],c,{...this.getFinanceSettings(),nowIso:o},{nowIso:o,allowApproximateTimestamp:!1});ga(u.events),ri(ae.demoSeed,"1"),Xt(this.getFinancialSnapshot(!0),"seedDemoIfNeeded")},clearAndReseedDemo(){Oi(ae.ledger),Oi(ae.demoSeed),oi(),this.seedDemoIfNeeded(!0),Xt(this.getFinancialSnapshot(!0),"clearAndReseedDemo")},deleteSampleData(){Oi(ae.ledger),ri(ae.demoSeed,"deleted"),oi(),Xt(this.getFinancialSnapshot(!0),"deleteSampleData")}};function ja(e){const t=e.getUiSettings();document.documentElement.dataset.appearance=t.appearance,document.documentElement.classList.toggle("settings-reduced-motion",t.reducedMotion),document.body.classList.toggle("settings-reduced-motion",t.reducedMotion)}const Ac=[",",";","	"];function Mc(e){return String(e||"").toLowerCase().replace(/[^a-z0-9]/g,"")}function jn(e,t){return e.find(n=>t.includes(Mc(n)))||""}function Ma(e,t){const n=[];let r="",o=!1;for(let c=0;c<e.length;c+=1){const u=e[c];u==='"'&&e[c+1]==='"'?(r+='"',c+=1):u==='"'?o=!o:u===t&&!o?(n.push(r.trim()),r=""):r+=u}return n.push(r.trim()),n}function Nc(e){const t=Ac.map(n=>({delimiter:n,fields:Ma(e,n).length})).sort((n,r)=>r.fields-n.fields);return t[0].fields>1?t[0].delimiter:","}function Na(e){const t=String(e||"").split(/\r?\n/).filter(o=>o.trim());if(t.length<2)throw new Error("Provide a header row and at least one transaction.");const n=Nc(t[0]),r=Ma(t[0],n).map(o=>o.trim());if(r.some(o=>!o))throw new Error("Every CSV column needs a header.");if(new Set(r).size!==r.length)throw new Error("CSV headers must be unique.");return{delimiter:n,headers:r,rows:t.slice(1).map((o,c)=>({rowNumber:c+2,values:Ma(o,n)}))}}function Tr(e){return{date:jn(e,["date","bookingdate","transactiondate","valuedate"]),description:jn(e,["description","memo","note","details","payee","reference","narrative"]),amount:jn(e,["amount","value","total","transactionamount"]),debit:jn(e,["debit","withdrawal","outflow","moneyout"]),credit:jn(e,["credit","deposit","inflow","moneyin"]),category:jn(e,["category","categoryid"]),scope:jn(e,["scope","group"])}}function Dc(e){const t=String(e||"").trim(),n=t.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/),r=n?`${n[3]}-${n[2].padStart(2,"0")}-${n[1].padStart(2,"0")}`:t,o=Date.parse(`${r}T12:00:00`);return Number.isFinite(o)?new Date(o).toISOString().slice(0,10):""}function va(e){const t=String(e||"").trim();if(!t)return 0;const n=t.startsWith("(")&&t.endsWith(")");let r=t.replace(/[()\s']/g,"").replace(/[^\d,.-]/g,"");const o=r.lastIndexOf(","),c=r.lastIndexOf(".");if(o>=0&&c>=0){const m=o>c?",":".";r=r.replace(m===","?/\./g:/,/g,"").replace(m,".")}else if(o>=0){const m=r.length-o-1;r=m>0&&m<=2?r.replace(",","."):r.replace(/,/g,"")}const u=Number(r);return Number.isFinite(u)?n?-Math.abs(u):u:Number.NaN}function Bn(e,t,n){if(!n)return"";const r=e.headers.indexOf(n);return r>=0?String(t.values[r]||"").trim():""}function Cc(e){return`${e.date}|${e.description.trim().toLowerCase()}|${Number(e.amount).toFixed(2)}`}function xc(e,t,n={}){const r=[],o=[],c=[],u=new Set(n.existingFingerprints||[]),m=new Set,f=String(n.defaultCategory||"uncategorized").trim()||"uncategorized",y=["personal","shared"].includes(n.defaultScope)?n.defaultScope:"business",h=new Set(e.headers),b=[t.date,t.description].filter(Boolean);if(b.length!==2||b.some(N=>!h.has(N)))throw new Error("Map both the date and description columns.");const _=!!(t.amount&&h.has(t.amount)),B=!!(t.debit&&h.has(t.debit)||t.credit&&h.has(t.credit));if(!_&&!B)throw new Error("Map a signed amount column or at least one debit or credit column.");return e.rows.forEach(N=>{const x=Dc(Bn(e,N,t.date)),q=Bn(e,N,t.description),H=_?va(Bn(e,N,t.amount)):Math.abs(va(Bn(e,N,t.credit)))-Math.abs(va(Bn(e,N,t.debit)));if(!x){r.push({rowNumber:N.rowNumber,reason:"Date is missing or invalid."});return}if(!q){r.push({rowNumber:N.rowNumber,reason:"Description is missing."});return}if(!Number.isFinite(H)||H===0){r.push({rowNumber:N.rowNumber,reason:"Amount must be non-zero."});return}const fe=Bn(e,N,t.scope).toLowerCase(),J=["personal","business","shared"].includes(fe)?fe:y,K={date:x,description:q,amount:Math.round(H*100)/100,categoryId:Bn(e,N,t.category)||f,scope:J};if(K.fingerprint=Cc(K),u.has(K.fingerprint)||m.has(K.fingerprint)){o.push(K);return}m.add(K.fingerprint),c.push(K)}),{rows:c,rejected:r,duplicates:o,sourceFile:String(n.sourceFile||"pasted-transactions.csv")}}function kc(e){return e==="	"?"Tab":e===";"?"Semicolon":"Comma"}function L(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function an(e="shared"){return[["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function Fc(e="all"){return`<option value="all"${e==="all"?" selected":""}>All scopes</option>${an(e)}`}function yn(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric"}):"Unknown date"}function Tc(e){const t=String(e||"").replace(/_/g," ").replace(/\./g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Transaction"}function Ec(e){const t=Number(e.signedAmount);if(Number.isFinite(t))return t;const n=Math.abs(Number(e.amount)||0);return String(e.type)==="expense.recorded"?-n:n}function Xe(e,t=!1){return`
    <div class="modal-actions">
      <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
      <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'${e}'">${t?"Save":"Create"}</button>
    </div>
  `}function Yi(e,t){return t?`<button class="btn-danger ui-btn" type="button" data-action="${e}">Deactivate</button>`:""}function Pc(){return`
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
  `}function Rc(e="expense",t){const n=["expense","income","transfer","adjustment"].includes(e)?e:"expense";return`
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
          <select id="modal-fast-txn-scope">${an("business")}</select>
        </div>
        <div class="form-group fg-project">
          <label for="modal-fast-txn-project">Project plan</label>
          <select id="modal-fast-txn-project">${t.projectOptions()}</select>
        </div>
        <div class="form-group fg-note">
          <label for="modal-fast-txn-desc">Note <span class="fin-text-med">(optional)</span></label>
          <input id="modal-fast-txn-desc" placeholder="Client payment or studio rent" data-autofocus />
        </div>
      </div>
      ${Xe("transaction")}
    </div>
  `}const Et=document.querySelector("#modal-overlay"),xn=document.querySelector("#modal-body");let Vn="",hn="",Hn="",Ai="pasted-transactions.csv",Qe=null,Tt={date:"",description:""},Ke=null,Wn="uncategorized",Gn="business",Mi="skip",Tn="",zn=null,li=null,Da=null;const Er=["lead","proposal","expected","confirmed","invoiced","due","overdue","paid","cancelled","lost"],Oc={paid:1,invoiced:.95,due:.95,overdue:.85,confirmed:.9,retainer:.9,expected:.6,proposal:.4,lead:.15,cancelled:0,lost:0};let di=null;const kn=document.getElementById("quick-action-menu"),Ca=document.querySelector(".fin-fab-add"),Ie={search:"",accountId:"",scope:"all",categoryId:"",type:"all",reviewStatus:"all",dateFrom:"",dateTo:""};function T(e){return document.querySelector(`#${e}`)?.value.trim()||""}function $i(e){return document.querySelector(`#${e}`)?.checked===!0}function rn(){return window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10)}function lr(e=rn()){return window.FinanceDates?.dateOnlyToNoonIso?.(e)||new Date().toISOString()}function wi(e){return`${e}-${window.FinanceEvents?.createId?.()||Date.now().toString(36)}`}function Pe(e){const t=te.getFinanceSettings();return new Intl.NumberFormat(void 0,{style:"currency",currency:t.baseCurrency,maximumFractionDigits:2}).format(Number(e)||0)}function _c(){const e=di;return e?`
    <div class="modal-form">
      <h2 id="modal-title">${L(e.title)}</h2>
      <p class="modal-copy">${L(e.copy)}</p>
      <p class="modal-copy"><strong>Recommended first:</strong> export a backup from Settings if you may need this data later.</p>
      <div class="form-group">
        <label for="modal-destructive-phrase">Type ${L(e.phrase)} to continue</label>
        <input id="modal-destructive-phrase" data-autofocus autocomplete="off" spellcheck="false" />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button id="modal-destructive-confirm" class="btn-danger ui-btn" type="button" data-action="applyDestructiveConfirmation" disabled>${L(e.buttonLabel)}</button>
      </div>
    </div>
  `:'<div class="modal-form"><h2 id="modal-title">Confirmation unavailable</h2><p class="modal-copy">Close this dialog and try the action again.</p></div>'}function jc(){const e=document.querySelector("#modal-destructive-phrase"),t=document.querySelector("#modal-destructive-confirm");!e||!t||!di||(t.disabled=e.value!==di.phrase)}function Pr(e){!kn||!Ca||(kn.classList.toggle("active",e),kn.setAttribute("aria-hidden",e?"false":"true"),Ca.setAttribute("aria-expanded",e?"true":"false"))}function Bc(){Pr(!(kn?.classList.contains("active")??!1))}function Ni(){Pr(!1)}function Ln(e="",t="Not mapped"){const n=Qe?.headers||[];return`<option value="">${t}</option>${n.map(r=>`<option value="${L(r)}"${r===e?" selected":""}>${L(r)}</option>`).join("")}`}function Wi(e){return String(e||"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}function dr(e){return e.map(t=>String(t||"").trim().toLowerCase()).filter(Boolean).join("|")}function Lc(){if(!Qe)return[];const e=dr(Qe.headers);return e?(te.getImportState().profiles||[]).filter(n=>dr(n.headers||[])===e):[]}function Uc(e){e&&(Tt={...e.mapping},Wn=e.defaultCategory||Wn,Gn=e.defaultScope||Gn,e.accountId&&(Hn=e.accountId),Tn=e.name||"CSV mapping")}function Rr(){const e=te.getImportState(),t=Lc(),n=t.find(r=>r.id===e.lastProfileId)||t[0];Uc(n)}function ur(){if(Qe)try{Tn=te.saveCsvImportProfile({name:Ai,sourceFile:Ai,headers:Qe.headers,mapping:Tt,accountId:Hn,defaultCategory:Wn,defaultScope:Gn}).name}catch{}}function ye(e){if(!xn)return;let t=xn.querySelector(".modal-error");t||(t=document.createElement("div"),t.className="modal-error",t.setAttribute("role","alert"),t.tabIndex=-1,xn.querySelector("h2")?.insertAdjacentElement("afterend",t)),t.textContent=e,t.focus()}function zc(){const e=te.getFinancialSnapshot(),t=te.getFinancialReadModel(),n=window.FinanceDates?.toDateOnly?.(Ie.dateFrom)||"",r=window.FinanceDates?.toDateOnly?.(Ie.dateTo)||"",o=Ie.search.toLowerCase(),c=(t.transactions||[]).filter(u=>!Ie.accountId||String(u.accountId)===Ie.accountId||String(u.fromAccountId)===Ie.accountId||String(u.toAccountId)===Ie.accountId).filter(u=>Ie.scope==="all"||String(u.scope)===Ie.scope).filter(u=>!Ie.categoryId||String(u.categoryId).toLowerCase().includes(Ie.categoryId.toLowerCase())).filter(u=>Ie.type==="all"||String(u.ledgerType||u.type)===Ie.type||String(u.type)===Ie.type).filter(u=>Ie.reviewStatus==="all"||String(u.reviewStatus||"clear")===Ie.reviewStatus).filter(u=>o?[u.description,u.accountName,u.fromAccountName,u.toAccountName,u.categoryId].some(m=>String(m||"").toLowerCase().includes(o)):!0).filter(u=>{const m=window.FinanceDates?.toDateOnly?.(u.timestamp)||"";return(!n||m>=n)&&(!r||m<=r)});return`
    <div class="modal-form">
      <h2 id="modal-title">Transactions</h2>
      <p class="modal-copy">A searchable raw log. Use it as evidence for the Observatory, not as the center of the product.</p>
      <div class="modal-grid-two">
        ${[["Available cash",Pe(e.availableCash??e.trulyAvailableCash??e.realBalance)],["Reserved",Pe(e.reservedCash??0)],["Total cash",Pe(e.totalCash??e.realBalance)],["Monthly burn",Pe(e.monthlyBurn)],["Runway",e.runwayMonths==null?"Unknown":`${Number(e.runwayMonths).toFixed(1)} months`],["Debt remaining",Pe(e.debtRemaining??e.totalDebt)]].map(([u,m])=>`
          <div class="form-group"><label>${u}</label><input aria-label="${u}" value="${L(m)}" readonly /></div>
        `).join("")}
      </div>
      <div class="modal-section">
        <div class="ui-title">Filter ledger</div>
        <div class="modal-grid-three">
          <input id="modal-filter-search" aria-label="Search transactions" value="${L(Ie.search)}" placeholder="Search note, account, category" />
          <select id="modal-filter-account" aria-label="Filter by account">${bn(Ie.accountId)}</select>
          <select id="modal-filter-scope" aria-label="Filter by scope">${Fc(Ie.scope)}</select>
          <input id="modal-filter-category" aria-label="Filter by category" value="${L(Ie.categoryId)}" placeholder="Category" />
          <select id="modal-filter-type" aria-label="Filter by type">
            <option value="all"${Ie.type==="all"?" selected":""}>All types</option>
            <option value="income"${Ie.type==="income"?" selected":""}>Income</option>
            <option value="expense"${Ie.type==="expense"?" selected":""}>Expense</option>
            <option value="transfer"${Ie.type==="transfer"?" selected":""}>Transfer</option>
            <option value="adjustment"${Ie.type==="adjustment"?" selected":""}>Adjustment</option>
          </select>
          <select id="modal-filter-review-status" aria-label="Filter by review status">
            <option value="all"${Ie.reviewStatus==="all"?" selected":""}>All review states</option>
            <option value="clear"${Ie.reviewStatus==="clear"?" selected":""}>Clear</option>
            <option value="needs_review"${Ie.reviewStatus==="needs_review"?" selected":""}>Needs review</option>
            <option value="reviewed"${Ie.reviewStatus==="reviewed"?" selected":""}>Reviewed</option>
          </select>
          <input id="modal-filter-date-from" aria-label="Date from" type="date" value="${L(Ie.dateFrom)}" />
          <input id="modal-filter-date-to" aria-label="Date to" type="date" value="${L(Ie.dateTo)}" />
          <button class="ui-btn ui-btn--secondary" type="button" data-action="refreshTransactionsModal">Apply filters</button>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="exportTransactionsCsv">Export CSV</button>
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Ledger entries</div>
        ${c.length?c.map(u=>{const m=Ec(u),f=m>=0,y=u.ledgerType==="transfer"?`${L(u.fromAccountName||"From account")} → ${L(u.toAccountName||"To account")}`:L(u.accountName||"Unassigned");return`
          <div class="modal-list-row">
            <span><strong>${L(u.description||u.type)}</strong><br><small>${y} · ${L(u.categoryId||"uncategorized")} · ${L(u.reviewStatus||"clear")} · ${yn(u.timestamp)}</small></span>
            <span>${Tc(u.ledgerType||u.type)}${u.obligationId?` · ${L(u.obligationTitle||u.obligationId)}`:""}</span>
            <span class="${f?"fin-val-pos":"fin-val-neg"}">${f?"+":"-"}${Pe(Math.abs(m))}</span>
            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${L(Wi(u.id))}'">Review</button>
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
          <input id="modal-txn-date" aria-label="Transaction date" type="date" value="${rn()}" />
          <select id="modal-txn-account" aria-label="Transaction account">${bn("",!1)}</select>
          <select id="modal-txn-to-account" aria-label="Transfer destination account">${bn("",!1)}</select>
          <select id="modal-txn-direction" aria-label="Adjustment direction"><option value="increase">Increase account</option><option value="decrease">Decrease account</option></select>
          <input id="modal-txn-category" aria-label="Transaction category" placeholder="Category" value="uncategorized" />
          <select id="modal-txn-scope" aria-label="Transaction scope">${an("business")}</select>
        </div>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="addTransaction">Add transaction</button>
      </div>
    </div>
  `}function qc(e="expense"){return Rc(e,{accountOptions:bn,projectOptions:ui,today:rn})}function Vc(e=""){const t=(te.getFinancialReadModel().pipelineDeals||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark pipeline item as paid</h2>
      <p class="modal-copy">${L(t?.title||"Pipeline item")} · ${Pe(t?.value)}</p>
      <input id="modal-settle-id" type="hidden" value="${L(e)}" />
      <div class="form-group"><label for="modal-settle-account">Settlement account</label><select id="modal-settle-account">${bn(String(t?.destinationAccountId||""),!1)}</select></div>
      ${Xe("settleIncome")}
    </div>
  `}function Hc(){const e=te.getFinancialReadModel(),t=te.getFinancialSnapshot(),n=te.getReviewState(),r=e.fiatAccounts||[],o=[["unresolvedItems","1. Resolve unclear items",t.attentionQueue?t.attentionQueue.filter(c=>c.type==="Needs review").length===0:!0,"Categorize or clarify any ambiguous transactions."],["matchPayments","2. Match payments",!0,"Link incoming cash to expected invoices."],["confirmObligations","3. Confirm obligations",t.attentionQueue?t.attentionQueue.filter(c=>c.type==="Due soon"||c.type==="Overdue").length===0:!0,"Mark due costs as paid or deferred."],["reviewSignals","4. Review signals",Number(t.runwayMonths)>=3,"Inspect runway, low points, and missing inputs."],["closeMonth","5. Save checkpoint",!0,"Save the current review and reset the operating cycle."]];return`
    <div class="modal-form">
      <h2 id="modal-title">Monthly review</h2>
      <p class="modal-copy">A 5-step flow to verify your financial map.</p>
      <div class="modal-section">
        <div class="ui-title">Reconcile account balances</div>
        <div class="review-grid">
          ${r.length?r.map((c,u)=>`
            <label class="review-row">
              <input id="modal-review-account-${u}" class="review-account-check" type="checkbox" data-account-id="${L(c.id)}" />
              <span><strong>${L(c.name)}</strong><small>${L(c.scope||"shared")} · Confirm the live balance</small></span>
              <input id="modal-review-balance-${u}" class="review-balance-input" aria-label="${L(c.name)} reconciled balance" type="number" step="0.01" value="${L(c.balance)}" />
            </label>
          `).join(""):'<div class="fin-compact-empty">Add a cash account before completing a review.</div>'}
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Operating checks</div>
        <div class="review-grid">
        ${o.map(([c,u,m,f])=>`
          <label class="review-row ${m?"is-complete":""}">
            <input id="modal-review-${c}" type="checkbox" />
            <span><strong>${u}</strong><small>${f}</small></span>
          </label>
        `).join("")}
        </div>
      </div>
      <div class="form-group"><label for="modal-review-notes">Review notes</label><textarea id="modal-review-notes" rows="3" placeholder="What changed, what needs attention?">${L(n.notes)}</textarea></div>
      <p class="modal-copy">Last reviewed: ${n.lastReviewedAt?yn(n.lastReviewedAt):"Not reviewed yet"}</p>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Later</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="completeWeeklyReview">Mark review complete</button>
      </div>
    </div>
  `}function Wc(){const e=te.getGoalProgress();return`
    <div class="modal-form">
      <h2 id="modal-title">Savings and buffer goals</h2>
      <p class="modal-copy">Progress is derived from the current balances of linked cash accounts.</p>
      <div class="modal-section">
        ${e.length?e.map(t=>`
          <div class="modal-list-row">
            <span><strong>${L(t.name)}</strong><br><small>${L(t.type)} · ${Math.round(t.progressPercent)}% · ${Pe(t.currentAmount)} of ${Pe(t.targetAmount)}</small></span>
            <span class="goal-modal-actions">
              <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'goal', '${L(t.id)}'">Edit</button>
              <button class="fin-mini-btn" type="button" data-action="deleteGoal" data-action-args="'${L(t.id)}'">Delete</button>
            </span>
          </div>
        `).join(""):'<div class="fin-compact-empty">No goals yet. Add a safety buffer or a savings target.</div>'}
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Close</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="openEditModal" data-action-args="'goal'">Add goal</button>
      </div>
    </div>
  `}function Gc(e=""){const t=te.getGoals().goals.find(r=>r.id===e),n=te.getFinancialReadModel().fiatAccounts||[];return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit goal":"Add savings goal"}</h2>
      <p class="modal-copy">Link one or more cash accounts. Their balances become this goal's live progress.</p>
      <input id="modal-goal-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-goal-name">Goal name</label><input id="modal-goal-name" value="${L(t?.name||"")}" placeholder="Emergency buffer" /></div>
        <div class="form-group"><label for="modal-goal-type">Goal type</label><select id="modal-goal-type"><option value="buffer"${t?.type==="buffer"?" selected":""}>Buffer</option><option value="savings"${t?.type==="savings"?" selected":""}>Savings</option></select></div>
        <div class="form-group"><label for="modal-goal-target">Target amount</label><input id="modal-goal-target" type="number" step="0.01" min="0.01" value="${L(t?.targetAmount||"")}" /></div>
        <div class="form-group"><label for="modal-goal-date">Target date</label><input id="modal-goal-date" type="date" value="${L(t?.targetDate||"")}" /></div>
        <div class="form-group"><label for="modal-goal-scope">Scope</label><select id="modal-goal-scope">${an(t?.scope||"shared")}</select></div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Linked cash accounts</div>
        <div class="goal-account-grid">
          ${n.length?n.map((r,o)=>`
            <label class="settings-check goal-account-check">
              <input id="modal-goal-account-${o}" type="checkbox" value="${L(r.id)}"${t?.linkedAccountIds.includes(String(r.id))?" checked":""} />
              <span>${L(r.name)} · ${Pe(r.balance)}</span>
            </label>
          `).join(""):'<div class="fin-compact-empty">Add a cash account before linking progress.</div>'}
        </div>
      </div>
      ${Xe("goal",!!t)}
    </div>
  `}function Kc(){const e=!!Qe,t=!!Ke,n=Ke?.rows||[],r=Ke?.rejected||[],o=Ke?.duplicates||[],c=n.length+o.length;return`
    <div class="modal-form">
      <h2 id="modal-title">Import transactions from CSV</h2>
      <p class="modal-copy">Choose a local transaction CSV or paste CSV data. Map a signed amount column, or separate debit and credit columns, before importing.</p>
      <div class="csv-source-grid">
        <div class="form-group">
          <label for="modal-csv-file">CSV file</label>
          <div class="csv-file-actions">
            <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseCsvImport">Choose CSV file</button>
            <span>${L(Ai)}</span>
          </div>
          <input id="modal-csv-file" type="file" accept=".csv,text/csv,text/plain" hidden />
        </div>
        <div class="form-group">
          <label for="modal-csv-account">Destination account</label>
          <select id="modal-csv-account">${bn(Hn,!1)}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="modal-csv-text">CSV data</label>
        <textarea id="modal-csv-text" rows="7" placeholder="date,description,amount,category,scope">${L(Vn)}</textarea>
      </div>
      ${e?`
        <div class="modal-section">
          <div class="ui-title">Detected columns · ${kc(Qe?.delimiter||",")} separated</div>
          <div class="csv-columns">${Qe?.headers.map(u=>`<code>${L(u)}</code>`).join("")}</div>
          ${Tn?`<div class="fin-compact-empty">Saved mapping: ${L(Tn)}</div>`:""}
          <div class="csv-mapping-grid">
            <div class="form-group"><label for="modal-csv-map-date">Date *</label><select id="modal-csv-map-date">${Ln(Tt.date,"Choose date column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-description">Description *</label><select id="modal-csv-map-description">${Ln(Tt.description,"Choose description column")}</select></div>
            <div class="form-group"><label for="modal-csv-map-amount">Signed amount</label><select id="modal-csv-map-amount">${Ln(Tt.amount)}</select></div>
            <div class="form-group"><label for="modal-csv-map-debit">Debit</label><select id="modal-csv-map-debit">${Ln(Tt.debit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-credit">Credit</label><select id="modal-csv-map-credit">${Ln(Tt.credit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-category">Category</label><select id="modal-csv-map-category">${Ln(Tt.category)}</select></div>
            <div class="form-group"><label for="modal-csv-map-scope">Scope</label><select id="modal-csv-map-scope">${Ln(Tt.scope)}</select></div>
            <div class="form-group"><label for="modal-csv-default-category">Default category</label><input id="modal-csv-default-category" value="${L(Wn)}" /></div>
            <div class="form-group"><label for="modal-csv-default-scope">Default scope</label><select id="modal-csv-default-scope">${an(Gn)}</select></div>
          </div>
        </div>
      `:""}
      ${hn?`<div class="fin-compact-empty" role="alert">${L(hn)}</div>`:""}
      ${t?`
        <div class="modal-section">
          <div class="ui-title">Import preview</div>
          <div class="csv-preview-counts">
            <span>${n.length} accepted</span>
            <span>${o.length} duplicate${o.length===1?"":"s"}</span>
            <span>${r.length} rejected</span>
          </div>
          ${n.slice(0,6).map(u=>`<div class="modal-list-row"><span>${L(u.description)}<br><small>${L(u.date)} · ${L(u.categoryId)} · ${L(u.scope)}</small></span><span class="${u.amount>=0?"fin-val-pos":"fin-val-neg"}">${Pe(u.amount)}</span></div>`).join("")}
          ${o.length?`
            <div class="csv-validation-list">
              <strong>Duplicate handling</strong>
              <label><input type="radio" name="modal-csv-duplicate-policy" value="skip"${Mi==="skip"?" checked":""} /> Skip duplicates</label>
              <label><input type="radio" name="modal-csv-duplicate-policy" value="import"${Mi==="import"?" checked":""} /> Import duplicates anyway</label>
              ${o.slice(0,4).map(u=>`<span>${L(u.date)} · ${L(u.description)}</span>`).join("")}
            </div>
          `:""}
          ${r.length?`<div class="csv-validation-list csv-validation-list--error"><strong>Rejected rows</strong>${r.slice(0,6).map(u=>`<span>Row ${u.rowNumber}: ${L(u.reason)}</span>`).join("")}</div>`:""}
        </div>
      `:""}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="analyzeCsvImport">Analyze CSV</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="previewCsvImport"${e?"":" disabled"}>Preview import</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="importCsvData"${c?"":" disabled"}>Import valid rows</button>
      </div>
    </div>
  `}function Yc(){const e=li,t=e?.counts||{},n=e?.warnings||[];return`
    <div class="modal-form">
      <h2 id="modal-title">Restore Finance Master backup</h2>
      <p class="modal-copy">Review this backup before replacement. Restoring replaces your current local finance data, goals, settings, review state, import history, and cached prices.</p>
      <div class="csv-file-actions">
        <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseFinanceBackup">Choose backup file</button>
        <input id="modal-backup-file" type="file" accept="application/json,.json" hidden />
      </div>
      ${e?.valid?`
        <div class="backup-preview-card">
          <div><span>App</span><strong>${L(e.appName||"Finance Master")}</strong></div>
          <div><span>Backup version</span><strong>${L(e.version||"Unknown")}</strong></div>
          <div><span>Schema</span><strong>${L(e.schemaLabel||"Unknown")}</strong></div>
          <div><span>Exported</span><strong>${yn(e.exportedAt)}</strong></div>
          <div><span>Latest event</span><strong>${yn(e.latestLocalEventAt)}</strong></div>
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
            ${n.map(r=>`<span>${L(r)}</span>`).join("")}
          </div>
        `:""}
        <p class="modal-copy"><strong>Restore warning:</strong> clicking replace permanently overwrites the current local Finance Master data in this browser.</p>
      `:`
        <div class="csv-validation-list csv-validation-list--error" role="alert">
          <strong>This backup cannot be restored</strong>
          ${(e?.errors||["Choose a Finance Master backup file."]).map(r=>`<span>${L(r)}</span>`).join("")}
        </div>
      `}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="applyBackupRestore"${e?.valid?"":" disabled"}>Replace current data</button>
      </div>
    </div>
  `}function bn(e="",t=!0){const n=te.getFinancialReadModel().fiatAccounts||[];return!n.length&&!t?'<option value="">Operating cash (created on save)</option>':`${t?'<option value="">All accounts</option>':'<option value="">Choose an account</option>'}${n.map(o=>`
    <option value="${L(o.id)}"${String(o.id)===e?" selected":""}>${L(o.name)} · ${L(o.scope||"shared")}</option>
  `).join("")}`}function Qc(e){const t=String(e||"").trim();if(t)return t;try{const n=String(localStorage.getItem("finance-master.layout.treasury-project")||"").trim();return!n||n==="all"||n==="unassigned"?"":(te.getFinancialReadModel().projectProfiles||[]).some(o=>String(o.id)===n&&String(o.status||"active")!=="archived")?n:""}catch{return""}}function ui(e){const t=Qc(e);return`<option value="">No project</option>${(te.getFinancialReadModel().projectProfiles||[]).filter(r=>String(r.status||"active")!=="archived").map(r=>`
    <option value="${L(r.id)}"${String(r.id)===t?" selected":""}>${L(r.name)}${r.clientOrPurpose?` · ${L(r.clientOrPurpose)}`:""}</option>
  `).join("")}`}function Zc(e=""){const t=(te.getFinancialReadModel().projectProfiles||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit project plan":"Add project plan"}</h2>
      <p class="modal-copy">Project plans group wallets, reserves, obligations, income, and transactions without creating separate books.</p>
      <input id="modal-project-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="form-group"><label for="modal-project-name">Name</label><input id="modal-project-name" value="${L(t?.name||"")}" placeholder="Client launch or studio project" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-project-purpose">Client / purpose</label><input id="modal-project-purpose" value="${L(t?.clientOrPurpose||"")}" placeholder="Client, campaign, or internal project" /></div>
        <div class="form-group"><label for="modal-project-color">Color</label><select id="modal-project-color">
          ${["mint","blue","gold","rose","slate"].map(n=>`<option value="${n}"${String(t?.color||"mint")===n?" selected":""}>${n}</option>`).join("")}
        </select></div>
      </div>
      <div class="form-group"><label for="modal-project-notes">Notes <span class="fin-text-med">(optional)</span></label><textarea id="modal-project-notes" rows="3" placeholder="What this map is for">${L(t?.notes||"")}</textarea></div>
      <div class="modal-actions">${t?'<button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="archiveProjectProfile">Archive</button>':""}<span class="modal-actions-spacer"></span>${Xe("projectProfile",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function Jc(e=""){const t=(te.getFinancialReadModel().pipelineDeals||[]).find(b=>String(b.id)===e),n=String(t?.status||"expected").toLowerCase(),r=t?.probability??Oc[n]??.6,o=t&&Number.isFinite(Number(t.netAmount))?t.netAmount:t?.value,c=t&&Number.isFinite(Number(t.vatRate))?t.vatRate:"",u=String(t?.incomeType||"one_off"),m=u==="retainer"||u==="recurring",y=t&&t.durationValue!==null&&t.durationValue!==void 0&&String(t.durationValue).trim()!==""&&Number.isFinite(Number(t.durationValue))?Number(t.durationValue):"",h=String(t?.durationUnit||"months");return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit income":"Add income"}</h2>
      <p class="modal-copy">Use status to separate real, expected, overdue, and uncertain income.</p>
      <input id="modal-income-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="form-group"><label for="modal-income-title">Source</label><input id="modal-income-title" value="${L(t?.title||"")}" placeholder="Client or opportunity" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-income-amount">Amount before VAT</label><input id="modal-income-amount" type="number" step="0.01" value="${L(o||"")}" /></div>
        <div class="form-group"><label for="modal-income-vat-rate">VAT on top % <span class="fin-text-med">(optional)</span></label><input id="modal-income-vat-rate" type="number" min="0" max="100" step="0.1" value="${L(c)}" placeholder="0" /></div>
        <div class="form-group"><label for="modal-income-probability">Probability</label><input id="modal-income-probability" type="number" min="0" max="1" step="0.05" value="${L(r)}" /></div>
        <div class="form-group"><label for="modal-income-date">Expected date</label><input id="modal-income-date" type="date" value="${L(t?.expectedDateISO||rn())}" /></div>
        <div class="form-group"><label for="modal-income-status">Status</label><select id="modal-income-status">${Er.map(b=>`<option value="${b}"${n===b?" selected":""}>${b}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-type">Income type</label><select id="modal-income-type" onchange="const wrap=document.getElementById('modal-income-duration-wrap'); if (wrap) wrap.hidden = !(this.value === 'retainer' || this.value === 'recurring');">${["one_off","retainer","recurring"].map(b=>`<option value="${b}"${u===b?" selected":""}>${b.replace("_"," ")}</option>`).join("")}</select></div>
        <div id="modal-income-duration-wrap" class="modal-grid-two modal-grid-span" ${m?"":"hidden"}>
          <div class="form-group"><label for="modal-income-duration-value">Duration / quantity <span class="fin-text-med">(optional)</span></label><input id="modal-income-duration-value" type="number" min="0" step="1" value="${L(y)}" placeholder="6" /></div>
          <div class="form-group"><label for="modal-income-duration-unit">Unit</label><select id="modal-income-duration-unit">${["months","hours","times"].map(b=>`<option value="${b}"${h===b?" selected":""}>${b}</option>`).join("")}</select></div>
        </div>
        <div class="form-group"><label for="modal-income-scenario">Scenario Inclusion</label><select id="modal-income-scenario">${["realistic","conservative","optimistic","all"].map(b=>`<option${(t?.scenarioInclusion||"realistic")===b?" selected":""}>${b}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-income-scope">Scope</label><select id="modal-income-scope">${an(String(t?.scope||"business"))}</select></div>
        <div class="form-group"><label for="modal-income-project">Project plan</label><select id="modal-income-project">${ui(t?String(t.projectId||""):void 0)}</select></div>
      </div>
      <div class="form-group"><label for="modal-income-account">Settlement account</label><select id="modal-income-account">${bn(String(t?.destinationAccountId||""))}</select></div>
      ${Xe("income",!!t)}
    </div>
  `}function Xc(e=""){const t=(te.getFinancialReadModel().fiatAccounts||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit cash account":"Add cash account"}</h2>
      <input id="modal-fiat-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="form-group"><label for="modal-fiat-name">Name</label><input id="modal-fiat-name" value="${L(t?.name||"")}" placeholder="Operating cash" /></div>
      <div class="form-group"><label for="modal-fiat-balance">Balance</label><input id="modal-fiat-balance" type="number" step="0.01" value="${L(t?.balance||"")}" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-fiat-scope">Scope</label><select id="modal-fiat-scope">${an(String(t?.scope||"business"))}</select></div>
        <div class="form-group"><label for="modal-fiat-project">Project plan</label><select id="modal-fiat-project">${ui(t?String(t.projectId||""):void 0)}</select></div>
        <div class="form-group"><label for="modal-fiat-bucket">Bucket</label><select id="modal-fiat-bucket">
          ${[["available","Available cash"],["tax_reserve","Tax reserve"],["vat_reserve","VAT reserve"],["health_insurance","Health insurance"],["debt_repayment","Debt repayment"],["personal_survival","Personal survival"],["business_operating_costs","Business operating costs"],["buffer","Buffer"]].map(([n,r])=>`<option value="${n}"${String(t?.bucket||"available")===n?" selected":""}>${r}</option>`).join("")}
        </select></div>
      </div>
      <div class="modal-actions">${Yi("deactivateFiatAccount",!!t)}<span class="modal-actions-spacer"></span>${Xe("fiatAccount",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function el(e=""){const t=(te.getFinancialReadModel().reserveBuckets||[]).find(n=>String(n.id)===e);return`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit reserve bucket":"Add reserve bucket"}</h2>
      <input id="modal-reserve-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="form-group"><label for="modal-reserve-name">Name</label><input id="modal-reserve-name" value="${L(t?.name||"")}" placeholder="Tax Reserve 2026" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-reserve-target">Target amount</label><input id="modal-reserve-target" type="number" step="0.01" value="${L(t?.targetAmount||"")}" /></div>
        <div class="form-group"><label for="modal-reserve-current">Current amount</label><input id="modal-reserve-current" type="number" step="0.01" value="${L(t?.currentAmount||0)}" /></div>
        <div class="form-group"><label for="modal-reserve-purpose">Purpose</label><select id="modal-reserve-purpose">
          ${[["tax_reserve","Taxes"],["vat_reserve","VAT"],["health_insurance","Health insurance"],["debt_repayment","Debt repayment"],["personal_survival","Personal survival"],["buffer","Buffer"],["custom","Custom"]].map(([n,r])=>`<option value="${n}"${String(t?.purpose||"tax_reserve")===n?" selected":""}>${r}</option>`).join("")}
        </select></div>
        <div class="form-group"><label for="modal-reserve-scope">Scope</label><select id="modal-reserve-scope">${an(String(t?.scope||"shared"))}</select></div>
        <div class="form-group"><label for="modal-reserve-project">Project plan</label><select id="modal-reserve-project">${ui(t?String(t.projectId||""):void 0)}</select></div>
        <div class="form-group"><label for="modal-reserve-priority">Priority</label><select id="modal-reserve-priority">
          ${[["critical","Critical (Must fill)"],["high","High"],["medium","Medium"],["low","Low (If surplus)"]].map(([n,r])=>`<option value="${n}"${String(t?.priority||"high")===n?" selected":""}>${r}</option>`).join("")}
        </select></div>
      </div>
      <div class="modal-actions">${Yi("deactivateReserveBucket",!!t)}<span class="modal-actions-spacer"></span>${Xe("reserveBucket",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function tl(){return`
    <div class="modal-form">
      <h2 id="modal-title">Allocate Cash</h2>
      <p class="modal-copy">Move available cash into reserve buckets to protect it.</p>
      <div class="modal-section">
        <div class="form-group"><label for="modal-allocate-amount">Amount</label><input id="modal-allocate-amount" type="number" step="0.01" placeholder="0.00" /></div>
        <div class="form-group"><label for="modal-allocate-bucket">To bucket</label><select id="modal-allocate-bucket">
          ${(te.getFinancialReadModel().reserveBuckets||[]).map(t=>`<option value="${L(t.id)}">${L(t.name)} (${Pe(t.currentAmount)} of ${Pe(t.targetAmount)})</option>`).join("")}
        </select></div>
      </div>
      ${Xe("allocateReserves")}
    </div>
  `}function nl(e=""){const t=(te.getFinancialReadModel().recurringExpenses||[]).find(r=>String(r.id)===e);let n=t?.monthlyAmount||"";return t&&t.monthlyAmount&&(t.frequency==="quarterly"&&(n=t.monthlyAmount*3),t.frequency==="semi-annually"&&(n=t.monthlyAmount*6),t.frequency==="annually"&&(n=t.monthlyAmount*12)),`
    <div class="modal-form">
      <h2 id="modal-title">${t?"Edit recurring cost":"Add recurring cost"}</h2>
      <p class="modal-copy">Recurring costs become upcoming obligations and shape runway.</p>
      <input id="modal-expense-id" type="hidden" value="${L(t?.id||"")}" />
      <div class="form-group"><label for="modal-expense-category">Name</label><input id="modal-expense-category" value="${L(t?.category||"")}" placeholder="Health insurance or studio rent" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-amount">Amount</label><input id="modal-expense-amount" type="number" step="0.01" value="${L(n)}" /></div>
        <div class="form-group"><label for="modal-expense-frequency">Frequency</label><select id="modal-expense-frequency">
          <option value="monthly"${t?.frequency==="monthly"?" selected":""}>Monthly</option>
          <option value="quarterly"${t?.frequency==="quarterly"?" selected":""}>Quarterly</option>
          <option value="semi-annually"${t?.frequency==="semi-annually"?" selected":""}>Semi-annually</option>
          <option value="annually"${t?.frequency==="annually"?" selected":""}>Annually</option>
        </select></div>
      </div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-due-day">Due day</label><input id="modal-expense-due-day" type="number" min="1" max="28" value="${L(t?.dueDay||1)}" /></div>
        <div class="form-group"><label for="modal-expense-scope">Scope</label><select id="modal-expense-scope">${an(String(t?.scope||"personal"))}</select></div>
        <div class="form-group"><label for="modal-expense-project">Project plan</label><select id="modal-expense-project">${ui(t?String(t.projectId||""):void 0)}</select></div>
      </div>
      <label class="settings-check"><input id="modal-expense-essential" type="checkbox"${t?.essential?" checked":""} /><span>Essential expense</span></label>
      <div class="modal-actions">${Yi("deactivateRecurringExpense",!!t)}<span class="modal-actions-spacer"></span>${Xe("expense",!!t).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function il(e,t=""){const n=te.getFinancialReadModel().debtAccounts||[];if(e==="debtPayment")return n.length?`
      <div class="modal-form">
        <h2 id="modal-title">Record debt payment</h2>
        <div class="form-group"><label for="modal-debt-payment-id">Debt</label><select id="modal-debt-payment-id">${n.map(o=>`<option value="${L(o.id)}">${L(o.name)} (${Pe(o.outstanding)})</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-debt-payment-amount">Payment</label><input id="modal-debt-payment-amount" type="number" step="0.01" /></div>
        ${Xe("debtPayment")}
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
      `;const r=n.find(o=>String(o.id)===t);return`
    <div class="modal-form">
      <h2 id="modal-title">${r?"Add to debt":"Add debt"}</h2>
      <input id="modal-debt-id" type="hidden" value="${L(r?.id||"")}" />
      <div class="form-group"><label for="modal-debt-name">Name</label><input id="modal-debt-name" value="${L(r?.name||"")}" placeholder="Credit line" /></div>
      <div class="form-group"><label for="modal-debt-amount">${r?"Additional amount":"Amount"}</label><input id="modal-debt-amount" type="number" step="0.01" /></div>
      <div class="form-group"><label for="modal-debt-scope">Scope</label><select id="modal-debt-scope">${an(String(r?.scope||"business"))}</select></div>
      <div class="form-group"><label for="modal-debt-project">Project plan</label><select id="modal-debt-project">${ui(r?String(r.projectId||""):void 0)}</select></div>
      <div class="modal-actions">${Yi("deactivateDebtAccount",!!r)}<span class="modal-actions-spacer"></span>${Xe("debtAdd",!!r).replace('<div class="modal-actions">',"").replace("</div>","")}</div>
    </div>
  `}function Or(e){return((te.computeFinanceContext(!0).treasury||{}).obligations||[]).find(n=>String(n.id||"")===String(e||""))||null}function al(e=""){const t=Or(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Mark obligation paid</h2>
      <p class="modal-copy">${L(t?.title||"Obligation")} · ${Pe(t?.amount)} · due ${yn(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${L(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-obligation-account">Paid from account</label><select id="modal-obligation-account">${bn("",!1)}</select></div>
        <div class="form-group"><label for="modal-obligation-paid-at">Payment date</label><input id="modal-obligation-paid-at" type="date" value="${L(String(t?.dueDate||rn()).slice(0,10))}" /></div>
        <div class="form-group"><label for="modal-obligation-amount">Amount</label><input id="modal-obligation-amount" type="number" step="0.01" value="${L(t?.amount||"")}" /></div>
      </div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Optional note for the review trail"></textarea></div>
      ${Xe("obligationPayment")}
    </div>
  `}function rl(e=""){const t=Or(e);return`
    <div class="modal-form">
      <h2 id="modal-title">Defer obligation</h2>
      <p class="modal-copy">${L(t?.title||"Obligation")} · current due date ${yn(t?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${L(e)}" />
      <div class="form-group"><label for="modal-obligation-deferred-until">New due date</label><input id="modal-obligation-deferred-until" type="date" value="${rn()}" /></div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Why is this deferred?"></textarea></div>
      ${Xe("obligationDefer")}
    </div>
  `}function _r(e){return(te.getFinancialReadModel().transactions||[]).find(t=>String(t.id)===String(e||"")||String(t.transactionEntityId||"")===String(e||""))||null}function ol(e){const t=String(e?.source||"").trim();return e?.importBatchId||e?.sourceFile?"Imported from CSV":t==="obligation.review"?"Created from obligation review":t==="pipeline-settlement"?"Created from income settlement":t==="demo"?"Sample record":t==="manual"||t==="manual-ledger"?"Added manually":t?t.replace(/[._-]/g," "):"Local record"}function sl(e){const t=String(e?.importBatchId||"").trim();return t&&(te.getImportState().batches||[]).find(r=>String(r.id||"")===t)||null}function cl(e){if(!e)return[];const t=Number(e.importedCount??(Array.isArray(e.fingerprints)?e.fingerprints.length:0))||0,n=Number(e.duplicateCount||0),r=Number(e.duplicateImportedCount||0),o=Number(e.rejectedCount||0),c=(te.getFinancialReadModel().transactions||[]).filter(b=>String(b.importBatchId||"")===String(e.id||"")).length,u=e.duplicatePolicy==="import"?"duplicates imported":"duplicates skipped",m=`${Pe(e.incomeTotal||0)} in · ${Pe(e.expenseTotal||0)} out`,f=String(e.dateFrom||""),y=String(e.dateTo||""),h=f&&y?f===y?f:`${f} to ${y}`:"";return[["CSV batch",`${t} imported · ${n} duplicate${n===1?"":"s"} (${u}) · ${o} rejected`],["Batch totals",m],["Batch range",h],["Undo state",c>0?`${c} active record${c===1?"":"s"}`:"Undo applied"],["Duplicates included",r?String(r):""]]}function ll(e){const t=sl(e);return[["Category",String(e?.categoryId||"uncategorized")],["Scope",String(e?.scope||"shared")],["Source",ol(e)],["Review",String(e?.reviewStatus||"clear").replace(/[._-]/g," ")],["Source file",String(e?.sourceFile||"")],["Import batch",String(e?.importBatchId||"")],...cl(t),["Fingerprint",String(e?.fingerprint||"")],["Linked income",String(e?.linkedIncomeTitle||e?.linkedIncomeId||"")],["Linked obligation",String(e?.linkedObligationTitle||e?.obligationTitle||e?.obligationId||"")],["Linked debt",String(e?.linkedDebtTitle||e?.linkedDebtId||"")],["Linked reserve",String(e?.linkedReserveId||"")],["Reversal",e?.reversalOf?`Reversal of ${String(e.reversalOf)}`:e?.reversedBy?`Reversed by ${String(e.reversedBy)}`:""],["Record ID",String(e?.id||"")],["Transaction entity",String(e?.transactionEntityId||"")],["Created timestamp",String(e?.timestamp||"")]].filter((r,o,c)=>r[1].trim()&&c.findIndex(u=>u[0]===r[0]&&u[1]===r[1])===o)}function dl(e=""){return`<option value="">Choose obligation</option>${((te.computeFinanceContext(!0).treasury||{}).obligations||[]).filter(n=>String(n.status||"")!=="paid"&&String(n.type||"")!=="debt").map(n=>`
    <option value="${L(n.id)}"${String(n.id)===e?" selected":""}>${L(n.title)} · ${yn(n.dueDate)} · ${Pe(n.amount)}</option>
  `).join("")}`}function ul(e,t){const n=Date.parse(String(e||"")),r=Date.parse(String(t||""));return!Number.isFinite(n)||!Number.isFinite(r)?Number.POSITIVE_INFINITY:Math.abs(n-r)/864e5}function si(e){return String(e||"").toLowerCase().split(/[^a-z0-9]+/).map(t=>t.trim()).filter(t=>t.length>=4)}function ha(e,t,n,r){const o=String(t||"").trim();if(!o||o.toLowerCase()==="uncategorized")return;const c=e.get(o);(!c||r>c.score)&&e.set(o,{category:o,reason:n,score:r})}function ml(e){if(!e)return[];const t=te.getFinancialReadModel(),n=String(e.description||"").toLowerCase(),r=new Set(si(n)),o=new Map;return(t.transactions||[]).forEach(c=>{if(String(c.id||"")===String(e.id||""))return;const u=String(c.categoryId||"");if(!u||u.toLowerCase()==="uncategorized")return;const m=si(c.description).filter(f=>r.has(f));m.length?ha(o,u,"Used on similar ledger records",4+m.length):si(u).some(f=>n.includes(f))&&ha(o,u,"Category name appears in the description",3)}),(t.recurringExpenses||[]).forEach(c=>{const u=String(c.category||"");si(u).some(f=>n.includes(f))&&ha(o,u,"Matches a recurring obligation",5)}),Array.from(o.values()).sort((c,u)=>u.score-c.score||c.category.localeCompare(u.category)).slice(0,3).map(({category:c,reason:u})=>({category:c,reason:u}))}function pl(e){if(!e||String(e.type)!=="expense.recorded")return[];const t=Math.abs(Number(e.amount)||Number(e.signedAmount)||0),n=new Set(si(e.description));return((te.computeFinanceContext(!0).treasury||{}).obligations||[]).filter(o=>String(o.status||"")!=="paid"&&String(o.type||"")!=="debt").map(o=>{const c=Math.abs(Number(o.amount)||0),u=Math.abs(c-t),m=ul(e.timestamp,o.dueDate),f=si(o.title).filter(b=>n.has(b)).length;let y=0;const h=[];return u<.01?(y+=6,h.push("same amount")):u<=Math.max(5,t*.05)&&(y+=3,h.push("similar amount")),m<=3?(y+=4,h.push("near due date")):m<=10&&(y+=2,h.push("close date")),f&&(y+=f*2,h.push("matching description")),{id:String(o.id||""),title:String(o.title||"Obligation"),reason:h.join(" + ")||"possible obligation",score:y}}).filter(o=>o.id&&o.score>0).sort((o,c)=>c.score-o.score||o.title.localeCompare(c.title)).slice(0,3).map(({id:o,title:c,reason:u})=>({id:o,title:c,reason:u}))}function fl(e=""){const t=_r(e),n=ml(t),r=String(t?.linkedIncomeId||""),o=(te.getFinancialReadModel().pipelineDeals||[]).filter(f=>String(f.id||"")===r||!["paid","cancelled","lost","deleted"].includes(String(f.status||"").toLowerCase())),c=te.getFinancialReadModel().reserveBuckets||[],u=te.getFinancialReadModel().debtAccounts||[],m=ll(t);return`
    <div class="modal-form">
      <h2 id="modal-title">Review transaction</h2>
      <p class="modal-copy">${L(t?.description||"Transaction")} · ${Pe(t?.amount)} · ${yn(t?.timestamp)}</p>
      <p class="modal-copy">Linking is applied only when this review is saved. Choose "No linked ..." to unlink evidence.</p>
      <input id="modal-review-transaction-id" type="hidden" value="${L(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-transaction-category">Category</label><input id="modal-review-transaction-category" value="${L(t?.categoryId==="uncategorized"?"":t?.categoryId||"")}" placeholder="software, tax, client-income" /></div>
        <div class="form-group"><label for="modal-review-transaction-scope">Scope</label><select id="modal-review-transaction-scope">${an(String(t?.scope||"business"))}</select></div>
      </div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-linked-income">Linked income</label><select id="modal-review-linked-income">
          <option value="">No linked income</option>
          ${o.map(f=>`<option value="${L(f.id)}"${String(t?.linkedIncomeId||"")===String(f.id)?" selected":""}>${L(f.title||"Expected income")} · ${Pe(f.value)}</option>`).join("")}
        </select></div>
        <div class="form-group"><label for="modal-review-linked-reserve">Linked reserve</label><select id="modal-review-linked-reserve">
          <option value="">No linked reserve</option>
          ${c.map(f=>`<option value="${L(f.id)}"${String(t?.linkedReserveId||"")===String(f.id)?" selected":""}>${L(f.name||"Reserve bucket")}</option>`).join("")}
        </select></div>
        <div class="form-group"><label for="modal-review-linked-debt">Linked debt</label><select id="modal-review-linked-debt">
          <option value="">No linked debt</option>
          ${u.map(f=>`<option value="${L(f.id)}"${String(t?.linkedDebtId||"")===String(f.id)?" selected":""}>${L(f.name||"Debt item")} · ${Pe(f.outstanding)}</option>`).join("")}
        </select></div>
      </div>
      ${n.length?`
        <div class="csv-validation-list">
          <strong>Suggested categories</strong>
          ${n.map(f=>`
            <button class="fin-mini-btn" type="button" data-action="chooseTransactionCategorySuggestion" data-action-args="'${L(Wi(f.category))}'">${L(f.category)}</button>
            <span>${L(f.reason)}</span>
          `).join("")}
        </div>
      `:""}
      <div class="form-group"><label for="modal-review-transaction-notes">Review note</label><textarea id="modal-review-transaction-notes" rows="2" placeholder="Optional note for why this is clear"></textarea></div>
      ${m.length?`
        <details class="modal-technical-details">
          <summary>Technical details</summary>
          <div>
            ${m.map(([f,y])=>`<p><span>${L(f)}</span><strong>${L(y)}</strong></p>`).join("")}
          </div>
        </details>
      `:""}
      ${e?`
        <div class="modal-danger-zone">
          <span>
            <strong>Card settings</strong>
            <small>Reverse only after checking the transaction details above.</small>
          </span>
          <button class="fin-mini-btn fin-mini-btn--danger" type="button" data-action="deleteTransaction" data-action-args="'${L(Wi(e))}'">Reverse transaction</button>
        </div>
      `:""}
      ${Xe("transactionReview")}
    </div>
  `}function gl(e=""){const t=_r(e),n=pl(t);return`
    <div class="modal-form">
      <h2 id="modal-title">Match payment to obligation</h2>
      <p class="modal-copy">${L(t?.description||"Payment")} · ${Pe(t?.amount)} · ${yn(t?.timestamp)}</p>
      <input id="modal-match-transaction-id" type="hidden" value="${L(e)}" />
      <div class="form-group"><label for="modal-match-obligation-id">Obligation</label><select id="modal-match-obligation-id">${dl("")}</select></div>
      ${n.length?`
        <div class="csv-validation-list">
          <strong>Suggested matches</strong>
          ${n.map(r=>`
            <button class="fin-mini-btn" type="button" data-action="choosePaymentMatchSuggestion" data-action-args="'${L(Wi(r.id))}'">${L(r.title)}</button>
            <span>${L(r.reason)}</span>
          `).join("")}
        </div>
      `:""}
      <div class="form-group"><label for="modal-match-notes">Review note</label><textarea id="modal-match-notes" rows="2" placeholder="Optional note for the match"></textarea></div>
      ${Xe("paymentMatch")}
    </div>
  `}function vl(e=""){const t=(te.getFinancialReadModel().pipelineDeals||[]).find(r=>String(r.id)===e),n=String(t?.status||"expected").toLowerCase();return`
    <div class="modal-form">
      <h2 id="modal-title">Review pipeline item</h2>
      <p class="modal-copy">${L(t?.title||"Pipeline item")} · ${Pe(t?.value)}</p>
      <input id="modal-pipeline-review-id" type="hidden" value="${L(e)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-pipeline-review-status">Status</label><select id="modal-pipeline-review-status">${Er.map(r=>`<option value="${r}"${n===r?" selected":""}>${r}</option>`).join("")}</select></div>
        <div class="form-group"><label for="modal-pipeline-review-probability">Probability</label><input id="modal-pipeline-review-probability" type="number" min="0" max="1" step="0.05" value="${L(t?.probability??.65)}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-date">Expected date</label><input id="modal-pipeline-review-date" type="date" value="${L(t?.expectedDateISO||rn())}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-account">Settlement account</label><select id="modal-pipeline-review-account">${bn(String(t?.destinationAccountId||""))}</select></div>
      </div>
      <div class="form-group"><label for="modal-pipeline-review-notes">Review note</label><textarea id="modal-pipeline-review-notes" rows="2" placeholder="What changed about this income?"></textarea></div>
      ${Xe("pipelineReview")}
    </div>
  `}function hl(e=""){const t=(te.getFinancialReadModel().debtAccounts||[]).find(m=>String(m.id)===e),n=t?.planType||"regular",r=t?.paymentFrequency||t?.frequency||"monthly",o=t?.planStatus||"active",u=(t?.installments||[]).map((m,f)=>`
    <div class="custom-installment-row modal-grid-two" data-index="${f}" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
      <input type="date" class="modal-debt-plan-inst-date" value="${L(m.date)}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" value="${L(m.amount)}" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    </div>
  `).join("");return`
    <div class="modal-form">
      <h2 id="modal-title">${t?.planReviewedAt?"Edit debt payment plan":"Add debt payment plan"}</h2>
      <p class="modal-copy">${L(t?.name||"Debt item")} · ${Pe(t?.outstanding)} outstanding</p>
      <input id="modal-debt-plan-id" type="hidden" value="${L(e)}" />
      <div class="modal-grid-two">
        <div class="form-group">
          <label for="modal-debt-plan-status">Plan status</label>
          <select id="modal-debt-plan-status">
            ${[["active","Active"],["starts_later","Starts later"],["on_hold","On hold"],["irregular","Irregular"],["completed","Completed"],["archived","Archived"]].map(([m,f])=>`<option value="${m}"${String(o)===m?" selected":""}>${f}</option>`).join("")}
          </select>
        </div>
        <div class="form-group"><label for="modal-debt-plan-custom-pressure">Custom monthly pressure</label><input id="modal-debt-plan-custom-pressure" type="number" min="0" step="0.01" value="${L(t?.customMonthlyPressure??"")}" placeholder="Optional" /></div>
        <div class="form-group"><label for="modal-debt-plan-start-date">Start date</label><input id="modal-debt-plan-start-date" type="date" value="${L(t?.startDate||"")}" /></div>
        <div class="form-group"><label for="modal-debt-plan-end-date">End date</label><input id="modal-debt-plan-end-date" type="date" value="${L(t?.endDate||"")}" /></div>
      </div>
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
              <option value="weekly"${r==="weekly"?" selected":""}>Weekly</option>
              <option value="biweekly"${r==="biweekly"?" selected":""}>Biweekly</option>
              <option value="monthly"${r==="monthly"?" selected":""}>Monthly</option>
              <option value="quarterly"${r==="quarterly"?" selected":""}>Quarterly</option>
              <option value="yearly"${r==="yearly"||r==="annually"?" selected":""}>Yearly</option>
            </select>
          </div>
          <div class="form-group"><label for="modal-debt-plan-minimum">Minimum payment</label><input id="modal-debt-plan-minimum" type="number" min="0" step="0.01" value="${L(t?.paymentAmount||t?.minimumPayment||"")}" /></div>
        </div>
        <div class="form-group"><label for="modal-debt-plan-due-date">Next due date</label><input id="modal-debt-plan-due-date" type="date" value="${L(t?.dueDate||rn())}" /></div>
      </div>

      <div id="modal-debt-plan-custom-section" style="display: ${n==="custom"?"block":"none"};">
        <div class="form-group">
          <label>Installments</label>
          <div id="modal-debt-plan-custom-list">
            ${u}
          </div>
          <button type="button" class="btn-secondary ui-btn ui-btn--secondary" data-action="addCustomInstallment" style="margin-top: 0.5rem;">+ Add Installment</button>
        </div>
      </div>

      <div class="form-group"><label for="modal-debt-plan-note">Payment plan note <span class="fin-text-med">(optional)</span></label><textarea id="modal-debt-plan-note" rows="2" placeholder="Monthly minimum, creditor agreement, or next decision">${L(t?.paymentPlanNote||"")}</textarea></div>
      <div class="modal-section">
        <label class="settings-check"><input id="modal-debt-plan-include-burn" type="checkbox"${t?.includeInBurnRate===!1?"":" checked"} /><span>Include in monthly burn</span></label>
        <label class="settings-check"><input id="modal-debt-plan-include-safe" type="checkbox"${t?.includeInSafeToSpend===!1?"":" checked"} /><span>Include in Safe-to-Spend</span></label>
        <label class="settings-check"><input id="modal-debt-plan-include-runway" type="checkbox"${t?.includeInRunway===!1?"":" checked"} /><span>Include in runway</span></label>
      </div>
      ${Xe("debtPlan")}
    </div>
  `}function bl(e,t=""){return e==="quickAdd"?Pc():e==="transaction"?qc(t):e==="financeOverview"?zc():e==="weeklyReview"?Hc():e==="goals"?Wc():e==="goal"?Gc(t):e==="csvImport"?Kc():e==="backupRestore"?Yc():e==="destructiveConfirm"?_c():e==="projectProfile"?Zc(t):e==="settleIncome"?Vc(t):e==="income"?Jc(t):e==="fiatAccount"?Xc(t):e==="reserveBucket"?el(t):e==="allocateReserves"?tl():e==="web3Position"||e==="defiPosition"?'<div class="modal-form"><h2 id="modal-title">Postponed</h2><p class="modal-copy">Market portfolio tracking is outside the focused treasury MVP.</p></div>':e==="expense"?nl(t):e==="debtAdd"||e==="debtPayment"?il(e,t):e==="obligationPayment"?al(t):e==="obligationDefer"?rl(t):e==="transactionReview"?fl(t):e==="paymentMatch"?gl(t):e==="pipelineReview"?vl(t):e==="debtPlan"?hl(t):'<div class="modal-form"><h2 id="modal-title">Nothing to edit</h2></div>'}function ht(e,t={}){!Et||!xn||(Ni(),!Et.classList.contains("active")&&document.activeElement instanceof HTMLElement&&(Da=document.activeElement),Et.dataset.type=e,Et.classList.add("active"),Et.setAttribute("aria-hidden","false"),xn.innerHTML=bl(e,typeof t=="string"?t:String(t.id||"")),window.requestAnimationFrame(()=>{xn.querySelector('[data-autofocus], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus()}))}function vt(e){di=e,ht("destructiveConfirm")}function bt(){!Et||!xn||(Et.classList.remove("active"),Et.setAttribute("aria-hidden","true"),xn.innerHTML="",di=null,Da?.focus(),Da=null)}function Un(e,t){try{te.appendFinanceEvent(e,{source:t}),bt()}catch(n){ye(n instanceof Error?n.message:"Could not save this finance entry.")}}function jr(e){const t=T(`${e}-type`)||"expense",n=T(`${e}-desc`),r=Math.abs(Number(T(`${e}-amount`))),o=T(`${e}-account`),u=!((te.getFinancialReadModel().fiatAccounts||[]).length>0)&&t!=="transfer";if(!Number.isFinite(r)||r<=0||!o&&!u)return ye(u?"Add a positive amount.":"Add a positive amount and an account."),!1;try{return t==="transfer"?te.recordTransfer({description:n,amount:r,timestamp:lr(T(`${e}-date`)),fromAccountId:o,toAccountId:T(`${e}-to-account`),categoryId:T(`${e}-category`)||"transfer",scope:T(`${e}-scope`),projectId:T(`${e}-project`)}):te.recordLedgerTransaction({type:t==="income"||t==="adjustment"?t:"expense",description:n,amount:r,timestamp:lr(T(`${e}-date`)),accountId:o,categoryId:T(`${e}-category`)||(t==="income"?"client-income":t==="adjustment"?"adjustment":"uncategorized"),scope:T(`${e}-scope`),direction:T(`${e}-direction`)==="decrease"?"decrease":"increase",projectId:T(`${e}-project`)}),bt(),!0}catch(m){return ye(m instanceof Error?m.message:"Could not add this transaction."),!1}}function ba(){Vn=T("modal-csv-text")||Vn,Hn=T("modal-csv-account")||Hn,Wn=T("modal-csv-default-category")||Wn,Gn=T("modal-csv-default-scope")||Gn,Mi=document.querySelector('input[name="modal-csv-duplicate-policy"]:checked')?.value==="import"?"import":"skip",Qe&&(Tt={date:T("modal-csv-map-date"),description:T("modal-csv-map-description"),amount:T("modal-csv-map-amount"),debit:T("modal-csv-map-debit"),credit:T("modal-csv-map-credit"),category:T("modal-csv-map-category"),scope:T("modal-csv-map-scope")})}function yl(){const e=te.exportBackup(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=`finance-master-backup-${rn()}.json`,n.click(),te.recordBackupExport(e.exportedAt),URL.revokeObjectURL(n.href)}function wl(){const e=new Blob([te.exportTransactionsCsv()],{type:"text/csv;charset=utf-8"}),t=document.createElement("a");t.href=URL.createObjectURL(e),t.download=`finance-master-transactions-${rn()}.csv`,t.click(),URL.revokeObjectURL(t.href)}function Sl(e){const t=te.getFinanceSettings().baseCurrency,n=new Date().toISOString();if(e==="transaction"){jr("modal-fast-txn");return}if(e==="income"){const r=Number(T("modal-income-amount")),o=String(T("modal-income-vat-rate")||"").trim(),c=o?Number(o):0,u=Number(T("modal-income-probability")),m=T("modal-income-type")||"one_off",f=String(T("modal-income-duration-value")||"").trim(),y=f?Number(f):null,h=T("modal-income-duration-unit")||"months";if(!T("modal-income-title")||!Number.isFinite(r)||r===0||!Number.isFinite(u)||u<0||u>1||!Number.isFinite(c)||c<0||c>100){ye("Add an income source, a non-zero amount, an optional VAT rate between 0 and 100, and a probability between 0 and 1.");return}if((m==="retainer"||m==="recurring")&&f&&(!Number.isFinite(Number(y))||Number(y)<=0||!["months","hours","times"].includes(h))){ye("For retainer or recurring income, duration must be a positive number with months, hours, or times.");return}const b=Math.abs(r),_=Math.round(b*(c/100)*100)/100,B=Math.round((b+_)*100)/100,N=(m==="retainer"||m==="recurring")&&y?{durationValue:y,durationUnit:h}:{};Un({type:"pipeline.created",amount:B,currency:t,timestamp:n,related_entity_id:T("modal-income-id")||wi("pipeline"),metadata:{title:T("modal-income-title"),value:B,netAmount:b,vatRate:c,vatAmount:_,grossAmount:B,probability:u,status:T("modal-income-status"),stage:T("modal-income-status"),scenarioInclusion:T("modal-income-scenario")||"realistic",incomeType:m,...N,expectedDateISO:T("modal-income-date"),destinationAccountId:T("modal-income-account"),scope:T("modal-income-scope"),projectId:T("modal-income-project")||void 0}},"modal.income");return}if(e==="fiatAccount"){const r=Number(T("modal-fiat-balance"));if(!T("modal-fiat-name")||!Number.isFinite(r)){ye("Add an account name and a valid balance.");return}const o=T("modal-fiat-bucket")||"available";Un({type:"asset.account_set",amount:r,currency:t,timestamp:n,related_entity_id:T("modal-fiat-id")||wi("cash"),metadata:{name:T("modal-fiat-name"),balance:r,active:!0,scope:T("modal-fiat-scope"),projectId:T("modal-fiat-project")||void 0,bucket:o,reserved:o!=="available"}},"modal.fiatAccount");return}if(e==="reserveBucket"){let r=T("modal-reserve-name"),o=Number(T("modal-reserve-target"));const c=Number(T("modal-reserve-current"))||0;if((!Number.isFinite(o)||o<=0)&&c>0){const u=r.match(/^(.*[^\s\d])(\d+(?:\.\d+)?)$/);u&&(r=u[1].trim(),o=Number(u[2]))}if(!r||!Number.isFinite(o)||o<=0||c<0){ye("Add a name, a positive target amount, and a valid current amount.");return}Un({type:"asset.reserve_set",amount:o,currency:t,timestamp:n,related_entity_id:T("modal-reserve-id")||wi("reserve"),metadata:{name:r,targetAmount:o,currentAmount:c,purpose:T("modal-reserve-purpose"),scope:T("modal-reserve-scope"),projectId:T("modal-reserve-project")||void 0,priority:T("modal-reserve-priority"),active:!0}},"modal.reserveBucket");return}if(e==="allocateReserves"){const r=Number(T("modal-allocate-amount")),o=T("modal-allocate-bucket");if(!o||!Number.isFinite(r)||r<=0){ye("Enter a valid amount to allocate.");return}const c=(te.getFinancialReadModel().reserveBuckets||[]).find(u=>String(u.id)===o);if(!c){ye("Choose an existing reserve bucket before allocating cash.");return}Un({type:"asset.reserve_allocated",amount:r,currency:t,timestamp:n,related_entity_id:o,metadata:{currentAmount:(Number(c.currentAmount)||0)+r}},"modal.allocateReserves");return}if(e==="expense"){const r=Math.abs(Number(T("modal-expense-amount"))),o=T("modal-expense-frequency")||"monthly";let c=r;o==="quarterly"&&(c=r/3),o==="semi-annually"&&(c=r/6),o==="annually"&&(c=r/12);const u=Number(T("modal-expense-due-day"));if(!T("modal-expense-category")||!Number.isFinite(r)||r<=0||!Number.isFinite(u)||u<1||u>28){ye("Add a cost name, positive amount, and due day from 1 to 28.");return}Un({type:"expense.recurring_set",amount:r,currency:t,timestamp:n,related_entity_id:T("modal-expense-id")||wi("expense"),metadata:{category:T("modal-expense-category"),monthlyAmount:c,essential:$i("modal-expense-essential"),active:!0,dueDay:u,frequency:o,scope:T("modal-expense-scope"),projectId:T("modal-expense-project")||void 0}},"modal.expense");return}if(e==="debtAdd"){const r=Math.abs(Number(T("modal-debt-amount")));if(!T("modal-debt-name")||!Number.isFinite(r)||r<=0){ye("Add a debt name and a positive amount.");return}Un({type:"debt.added",amount:r,currency:t,timestamp:n,related_entity_id:T("modal-debt-id")||wi("debt"),metadata:{name:T("modal-debt-name"),scope:T("modal-debt-scope"),projectId:T("modal-debt-project")||void 0}},"modal.debtAdd");return}if(e==="projectProfile"){try{te.saveProjectProfile({id:T("modal-project-id")||void 0,name:T("modal-project-name"),clientOrPurpose:T("modal-project-purpose"),color:T("modal-project-color"),notes:T("modal-project-notes"),status:"active"}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not save this project plan.")}return}if(e==="debtPayment"){const r=Math.abs(Number(T("modal-debt-payment-amount")));if(!T("modal-debt-payment-id")||!Number.isFinite(r)||r<=0){ye("Choose a debt item and enter a positive payment amount.");return}Un({type:"debt.payment_made",amount:r,currency:t,timestamp:n,related_entity_id:T("modal-debt-payment-id"),metadata:{}},"modal.debtPayment");return}if(e==="obligationPayment"){const r=Math.abs(Number(T("modal-obligation-amount")));if(!T("modal-obligation-id")||!T("modal-obligation-account")||!Number.isFinite(r)||r<=0){ye("Choose an obligation, payment account, and positive amount.");return}try{te.reviewObligation({id:T("modal-obligation-id"),status:"paid",accountId:T("modal-obligation-account"),paidAt:T("modal-obligation-paid-at"),amount:r,notes:T("modal-obligation-notes")}),bt()}catch(o){ye(o instanceof Error?o.message:"Could not mark this obligation paid.")}return}if(e==="obligationDefer"){if(!T("modal-obligation-id")||!T("modal-obligation-deferred-until")){ye("Choose an obligation and a new due date.");return}try{te.reviewObligation({id:T("modal-obligation-id"),status:"deferred",deferredUntil:T("modal-obligation-deferred-until"),notes:T("modal-obligation-notes")}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not defer this obligation.")}return}if(e==="transactionReview"){if(!T("modal-review-transaction-id")||!T("modal-review-transaction-category")){ye("Choose a transaction category before clearing this item.");return}try{te.reviewTransaction({id:T("modal-review-transaction-id"),categoryId:T("modal-review-transaction-category"),scope:T("modal-review-transaction-scope"),notes:T("modal-review-transaction-notes"),linkedIncomeId:T("modal-review-linked-income"),linkedReserveId:T("modal-review-linked-reserve"),linkedDebtId:T("modal-review-linked-debt")}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not categorize this transaction.")}return}if(e==="paymentMatch"){if(!T("modal-match-transaction-id")||!T("modal-match-obligation-id")){ye("Choose a payment and an obligation to match.");return}try{te.matchTransactionToObligation({transactionId:T("modal-match-transaction-id"),obligationId:T("modal-match-obligation-id"),notes:T("modal-match-notes")}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not match this payment.")}return}if(e==="pipelineReview"){const r=Number(T("modal-pipeline-review-probability"));if(!T("modal-pipeline-review-id")||!T("modal-pipeline-review-date")||!Number.isFinite(r)||r<0||r>1){ye("Choose a pipeline item, expected date, and probability between 0 and 1.");return}try{te.updatePipelineReview({id:T("modal-pipeline-review-id"),status:T("modal-pipeline-review-status"),probability:r,expectedDateISO:T("modal-pipeline-review-date"),destinationAccountId:T("modal-pipeline-review-account"),notes:T("modal-pipeline-review-notes")}),bt()}catch(o){ye(o instanceof Error?o.message:"Could not update this pipeline item.")}return}if(e==="debtPlan"){const r=T("modal-debt-plan-type")||"regular",o=T("modal-debt-plan-status")||"active",c=T("modal-debt-plan-frequency"),u=Number(T("modal-debt-plan-minimum")),m=T("modal-debt-plan-due-date"),f=T("modal-debt-plan-start-date"),y=T("modal-debt-plan-end-date"),h=T("modal-debt-plan-custom-pressure")?Number(T("modal-debt-plan-custom-pressure")):null,b=T("modal-debt-plan-note"),_=[];if(r==="custom"){const B=document.querySelectorAll(".modal-debt-plan-inst-date"),N=document.querySelectorAll(".modal-debt-plan-inst-amount");for(let x=0;x<B.length;x++)B[x].value&&Number(N[x].value)>0&&_.push({date:B[x].value,amount:Number(N[x].value)});if(_.length===0){ye("Add at least one valid installment for a custom plan.");return}}else if(o==="active"&&(!m||!Number.isFinite(u)||u<=0)){ye("Add a due date and positive minimum payment.");return}if(o==="starts_later"&&!f){ye("Choose when this payment plan starts.");return}if(h!==null&&(!Number.isFinite(h)||h<0)){ye("Add a valid custom monthly pressure or leave it empty.");return}if(!T("modal-debt-plan-id")){ye("Invalid debt ID.");return}try{te.saveDebtPlan({id:T("modal-debt-plan-id"),dueDate:m||_[0]?.date||new Date().toISOString(),minimumPayment:u||_[0]?.amount||0,paymentPlanNote:b,planType:r,planStatus:o,startDate:f,endDate:y,customMonthlyPressure:h,frequency:c,installments:_,includeInBurnRate:$i("modal-debt-plan-include-burn"),includeInSafeToSpend:$i("modal-debt-plan-include-safe"),includeInRunway:$i("modal-debt-plan-include-runway")}),bt()}catch(B){ye(B instanceof Error?B.message:"Could not save this debt plan.")}return}if(e==="goal"){try{te.saveGoal({id:T("modal-goal-id")||void 0,name:T("modal-goal-name"),type:T("modal-goal-type")==="savings"?"savings":"buffer",targetAmount:Number(T("modal-goal-target")),targetDate:T("modal-goal-date")||void 0,scope:T("modal-goal-scope"),linkedAccountIds:[...document.querySelectorAll('[id^="modal-goal-account-"]:checked')].map(r=>r.value)}),ht("goals")}catch(r){ye(r instanceof Error?r.message:"Could not save this goal.")}return}if(e==="settleIncome"){if(!T("modal-settle-account")){ye("Choose a settlement account before marking this item as paid.");return}try{te.markPipelineItemPaid(T("modal-settle-id"),{destinationAccountId:T("modal-settle-account")}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not mark this income as paid.")}}}function $l(e){const t=[];return e.replace(/'((?:\\.|[^'])*)'/g,(n,r)=>(t.push(r.replace(/\\'/g,"'").replace(/\\\\/g,"\\")),"")),t}function Il(e){const t=e.split(".").reduce((n,r)=>!n||typeof n!="object"?null:n[r],window);return typeof t=="function"?t:null}function ji(e,t){const n=T(t);n&&vt({action:e,targetId:n,title:"Deactivate item",copy:"This archives the selected item from active finance calculations while keeping the event history.",phrase:"DEACTIVATE ITEM",buttonLabel:"Deactivate item"})}Object.assign(window,{openEditModal:ht,requestDestructiveConfirmation:vt,closeModal:bt,toggleQuickActionMenu:Bc,closeQuickActionMenu:Ni,saveFinanceModal:Sl,addTransaction:()=>{jr("modal-txn")&&ht("financeOverview")},refreshTransactionsModal:()=>{Ie.search=T("modal-filter-search"),Ie.accountId=T("modal-filter-account"),Ie.scope=T("modal-filter-scope")||"all",Ie.categoryId=T("modal-filter-category"),Ie.type=T("modal-filter-type")||"all",Ie.reviewStatus=T("modal-filter-review-status")||"all",Ie.dateFrom=T("modal-filter-date-from"),Ie.dateTo=T("modal-filter-date-to"),ht("financeOverview")},deleteTransaction:e=>{e&&vt({action:"reverseTransaction",targetId:e,source:"modal.transaction.reverse",title:"Reverse transaction",copy:"This reverses the transaction and its linked account balance update.",phrase:"REVERSE TRANSACTION",buttonLabel:"Reverse transaction",renderAfter:!0})},markAsPaid:e=>{ht("settleIncome",{id:e})},deleteInvoice:e=>{if(!e)return;const t=(te.getFinancialReadModel().invoices||[]).find(n=>String(n.id)===e);vt({action:"deleteInvoice",targetId:e,reverseSettlement:String(t?.status||"").toLowerCase()==="paid",title:"Archive income entry",copy:"This archives the selected pipeline or settlement entry. If it is settled, the linked settlement can be reversed as part of the archive.",phrase:"ARCHIVE INCOME ENTRY",buttonLabel:"Archive entry"})},markObligationNeedsReview:e=>{try{te.reviewObligation({id:e,status:"needs_review"})}catch(t){window.alert(t instanceof Error?t.message:"Could not update this obligation.")}},cancelPipelineFromReview:e=>{e&&vt({action:"cancelPipelineItem",targetId:e,source:"Cancelled during Review.",title:"Cancel pipeline item",copy:"This removes the selected pipeline item from expected income and forecast assumptions.",phrase:"CANCEL PIPELINE ITEM",buttonLabel:"Cancel pipeline item",renderAfter:!0})},chooseTransactionCategorySuggestion:e=>{const t=document.getElementById("modal-review-transaction-category");t&&(t.value=e,t.focus())},choosePaymentMatchSuggestion:e=>{const t=document.getElementById("modal-match-obligation-id");t&&(t.value=e,t.focus())},toggleDebtPlanType:e=>{const t=document.getElementById("modal-debt-plan-regular-section"),n=document.getElementById("modal-debt-plan-custom-section");t&&(t.style.display=e==="regular"?"block":"none"),n&&(n.style.display=e==="custom"?"block":"none")},addCustomInstallment:()=>{const e=document.getElementById("modal-debt-plan-custom-list");if(!e)return;const t=e.children.length,n=document.createElement("div");n.className="custom-installment-row modal-grid-two",n.style.cssText="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;",n.dataset.index=String(t),n.innerHTML=`
      <input type="date" class="modal-debt-plan-inst-date" value="${rn()}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" placeholder="Amount" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    `,e.appendChild(n)},archiveProjectProfile:()=>{const e=T("modal-project-id");e&&vt({action:"archiveProjectProfile",targetId:e,title:"Archive project plan",copy:"This hides the project plan from active profile choices while keeping all tagged finance history intact.",phrase:"ARCHIVE PROJECT PLAN",buttonLabel:"Archive project",renderAfter:!0})},deactivateFiatAccount:()=>ji("deactivateFiatAccount","modal-fiat-id"),deactivateReserveBucket:()=>ji("deactivateReserveBucket","modal-reserve-id"),deactivateRecurringExpense:()=>ji("deactivateRecurringExpense","modal-expense-id"),deactivateDebtAccount:()=>ji("deactivateDebtAccount","modal-debt-id"),deleteDebtAccount:e=>{e&&vt({action:"deleteDebtAccount",targetId:e,title:"Delete mistaken debt",copy:"This reverses the selected debt, its payments, and its payment-plan events. Use archive for old debt history you want to keep visible in the record.",phrase:"DELETE DEBT ENTRY",buttonLabel:"Delete debt entry",renderAfter:!0})},pauseDebtPlan:e=>{try{te.setDebtPlanStatus(e,"on_hold"),window.FinancialMode?.render?.()}catch(t){window.alert(t instanceof Error?t.message:"Could not pause this debt plan.")}},reactivateDebtPlan:e=>{try{te.setDebtPlanStatus(e,"active"),window.FinancialMode?.render?.()}catch(t){window.alert(t instanceof Error?t.message:"Could not reactivate this debt plan.")}},completeDebtPlan:e=>{e&&vt({action:"completeDebtPlan",targetId:e,title:"Mark debt plan complete",copy:"This keeps the debt record in history and removes the plan from active monthly pressure.",phrase:"MARK DEBT COMPLETE",buttonLabel:"Mark complete",renderAfter:!0})},archiveDebtPlan:e=>{e&&vt({action:"archiveDebtPlan",targetId:e,title:"Archive debt plan",copy:"This hides the payment plan from active calculations while keeping the liability history available.",phrase:"ARCHIVE DEBT PLAN",buttonLabel:"Archive debt plan",renderAfter:!0})},resetDemoData:()=>{vt({action:"resetDemoData",title:"Restore sample data",copy:"This replaces the current local Finance Master ledger with the fictional sample data.",phrase:"RESTORE SAMPLE DATA",buttonLabel:"Restore sample data"})},deleteDemoData:()=>{vt({action:"deleteDemoData",title:"Delete sample data",copy:"This clears the fictional sample ledger from this browser. Your dashboard will be empty until you add entries or restore a backup.",phrase:"DELETE SAMPLE DATA",buttonLabel:"Delete sample data"})},resetLocalFinanceData:()=>{vt({action:"resetLocalFinanceData",title:"Reset local finance data",copy:"This clears only Finance Master local finance data in this browser, including ledger events, settings, review state, import history, goals, and cached local values.",phrase:"DELETE LOCAL FINANCE DATA",buttonLabel:"Reset local data"})},completeWeeklyReview:()=>{const e=[...document.querySelectorAll(".review-account-check")],t=["modal-review-unresolvedItems","modal-review-matchPayments","modal-review-confirmObligations","modal-review-reviewSignals","modal-review-closeMonth"];if(!e.length||e.some(r=>!r.checked)||t.some(r=>!$i(r))){ye("Confirm every account balance and complete each operating check before finishing the review.");return}const n=e.map((r,o)=>({accountId:r.dataset.accountId||"",rawBalance:T(`modal-review-balance-${o}`)}));if(n.some(r=>!r.rawBalance||!Number.isFinite(Number(r.rawBalance)))){ye("Add a valid balance for every reconciled account.");return}try{te.completeWeeklyReview({accounts:n.map(r=>({accountId:r.accountId,balance:Number(r.rawBalance)})),unresolvedItems:!0,matchPayments:!0,confirmObligations:!0,reviewSignals:!0,closeMonth:!0,notes:T("modal-review-notes")}),bt()}catch(r){ye(r instanceof Error?r.message:"Could not complete this review.")}},deleteGoal:e=>{e&&vt({action:"deleteGoal",targetId:e,title:"Delete savings goal",copy:"This deletes the selected savings or buffer goal. It does not delete linked account balances.",phrase:"DELETE SAVINGS GOAL",buttonLabel:"Delete goal",reopenModal:"goals"})},exportFinanceBackup:()=>yl(),exportTransactionsCsv:()=>wl(),chooseFinanceBackup:()=>document.querySelector("#modal-backup-file")?.click(),undoImportBatch:e=>{e&&vt({action:"undoImportBatch",targetId:e,title:"Undo CSV import",copy:"This reverses the transactions imported in the selected CSV batch.",phrase:"UNDO CSV IMPORT",buttonLabel:"Undo import",renderAfter:!0})},chooseCsvImport:()=>document.querySelector("#modal-csv-file")?.click(),analyzeCsvImport:()=>{try{ba(),Qe=Na(Vn),Tt=Tr(Qe.headers),Tn="",Rr(),Ke=null,hn="",ht("csvImport")}catch(e){Qe=null,Ke=null,Tn="",hn=e instanceof Error?e.message:"Could not parse this CSV.",ht("csvImport")}},previewCsvImport:()=>{try{ba(),Qe||(Qe=Na(Vn));const e=te.getActiveFinanceEvents().map(t=>String(t.metadata?.fingerprint||"")).filter(Boolean);Ke=xc(Qe,Tt,{existingFingerprints:e,defaultCategory:Wn,defaultScope:Gn,sourceFile:Ai}),ur(),hn="",ht("csvImport")}catch(e){Ke=null,hn=e instanceof Error?e.message:"Could not preview this CSV.",ht("csvImport")}},importCsvData:()=>{if(ba(),!Hn){ye("Choose a destination account before importing.");return}if(!Ke){ye("Preview at least one valid row before importing.");return}try{const e=Mi==="import"?[...Ke.rows,...Ke.duplicates]:Ke.rows;if(!e.length){ye("Preview at least one valid row before importing.");return}const t=te.importCsvTransactions(e,{accountId:Hn,sourceFile:Ke.sourceFile,duplicatePolicy:Mi,duplicateCount:Ke.duplicates.length,rejectedCount:Ke.rejected.length});ur(),hn=`Imported ${t.imported} row${t.imported===1?"":"s"}${t.duplicateImported?` · included ${t.duplicateImported} duplicate${t.duplicateImported===1?"":"s"}`:""}${t.duplicates?` · skipped ${t.duplicates} duplicate${t.duplicates===1?"":"s"}`:""}.`,Ke=null,ht("csvImport")}catch(e){ye(e instanceof Error?e.message:"Could not import this CSV.")}},applyBackupRestore:()=>{if(!li?.valid||!zn){ye("Choose a valid Finance Master backup before restoring.");return}vt({action:"restoreBackup",title:"Replace local finance data",copy:"This replaces the current local Finance Master data in this browser with the selected backup.",phrase:"RESTORE LOCAL FINANCE DATA",buttonLabel:"Replace current data"})},applyDestructiveConfirmation:()=>{const e=di;if(!e){ye("Choose an action before confirming.");return}if(T("modal-destructive-phrase")!==e.phrase){ye("The confirmation phrase does not match.");return}try{if(e.action==="restoreBackup"){if(!li?.valid||!zn)throw new Error("Choose a valid Finance Master backup before restoring.");te.restoreBackup(zn),zn=null,li=null}else if(e.action==="resetLocalFinanceData")te.resetLocalFinanceData();else if(e.action==="resetDemoData")te.clearAndReseedDemo();else if(e.action==="deleteDemoData")te.deleteSampleData();else if(e.action==="archiveProjectProfile"){if(!e.targetId)throw new Error("Choose a project plan before archiving.");te.archiveProjectProfile(e.targetId)}else if(e.action==="deactivateFiatAccount"||e.action==="deactivateReserveBucket"||e.action==="deactivateRecurringExpense"||e.action==="deactivateDebtAccount"){if(!e.targetId)throw new Error("Choose an item before deactivating.");te[e.action](e.targetId)}else if(e.action==="deleteDebtAccount"){if(!e.targetId)throw new Error("Choose a debt item before deleting.");te.deleteDebtAccount(e.targetId)}else if(e.action==="completeDebtPlan"){if(!e.targetId)throw new Error("Choose a debt item before completing.");te.setDebtPlanStatus(e.targetId,"completed")}else if(e.action==="archiveDebtPlan"){if(!e.targetId)throw new Error("Choose a debt item before archiving.");te.setDebtPlanStatus(e.targetId,"archived")}else if(e.action==="reverseTransaction"){if(!e.targetId)throw new Error("Choose a transaction before reversing.");te.reverseTransaction(e.targetId,e.source||"modal.transaction.reverse")}else if(e.action==="deleteInvoice"){if(!e.targetId)throw new Error("Choose an income entry before archiving.");te.deleteInvoice(e.targetId,{reverseSettlement:e.reverseSettlement===!0})}else if(e.action==="cancelPipelineItem"){if(!e.targetId)throw new Error("Choose a pipeline item before cancelling.");te.cancelPipelineItem(e.targetId,e.source||"Cancelled.")}else if(e.action==="deleteGoal"){if(!e.targetId)throw new Error("Choose a goal before deleting.");te.deleteGoal(e.targetId)}else if(e.action==="undoImportBatch"){if(!e.targetId)throw new Error("Choose an import batch before undoing.");te.undoImportBatch(e.targetId)}const t=e.reopenModal,n=e.renderAfter===!0;ja(te),bt(),t&&ht(t),(n||!t)&&window.FinancialMode?.render?.()}catch(t){ye(t instanceof Error?t.message:"Could not complete this action.")}}});document.addEventListener("click",e=>{const t=e.target?.closest("[data-action]"),n=e.target;if(!t){n&&kn?.classList.contains("active")&&!kn.contains(n)&&!Ca?.contains(n)&&Ni();return}const r=t.dataset.action;r&&(r!=="toggleQuickActionMenu"&&kn?.contains(t)&&Ni(),e.preventDefault(),Il(r)?.(...$l(t.dataset.actionArgs||"")))});Et?.addEventListener("click",e=>{e.target===Et&&bt()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&kn?.classList.contains("active")){Ni();return}if(!Et?.classList.contains("active"))return;if(e.key==="Escape"){bt();return}if(e.key!=="Tab")return;const t=[...Et.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(o=>o.offsetParent!==null);if(!t.length)return;const n=t[0],r=t[t.length-1];Et.contains(document.activeElement)?e.shiftKey&&document.activeElement===n?(e.preventDefault(),r.focus()):!e.shiftKey&&document.activeElement===r&&(e.preventDefault(),n.focus()):(e.preventDefault(),(e.shiftKey?r:n).focus())});document.addEventListener("input",e=>{e.target?.id==="modal-destructive-phrase"&&jc()});document.addEventListener("change",e=>{const t=e.target;if(!t?.files?.[0])return;const n=new FileReader;if(t.id==="modal-csv-file"){n.onload=()=>{try{Vn=String(n.result||""),Ai=t.files?.[0]?.name||"imported-transactions.csv",Qe=Na(Vn),Tt=Tr(Qe.headers),Tn="",Rr(),Ke=null,hn="",ht("csvImport")}catch(r){Qe=null,Ke=null,Tn="",hn=r instanceof Error?r.message:"Could not parse this CSV file.",ht("csvImport")}},n.readAsText(t.files[0]);return}t.id==="modal-backup-file"&&(n.onload=()=>{try{zn=JSON.parse(String(n.result||"")),li=te.previewBackup(zn)}catch(r){zn=null,li={valid:!1,counts:{},errors:[r instanceof Error?r.message:"Could not read this backup."]}}ht("backupRestore")},n.readAsText(t.files[0]))});function Al(e,t){const n={decisions:{title:"Decision Lab",copy:"Test spending, payment, income, and project decisions before acting.",sections:["decisionBoard"]},flow:{title:"Cash Timeline",copy:"Upcoming income, obligations, payment plans, low points, and runway over time.",sections:["cashCalendar","scenarioOutcomes","projection","invoices"]},plan:{title:"Money Plan",copy:"Accounts, reserves, recurring costs, debts, payment plans, and project cash.",sections:["reserves"]},radar:{title:"Risk Radar",copy:"Early warnings, weak assumptions, concentration risks, and opportunities.",sections:["reports"]},review:{title:"Reality Check",copy:"A lightweight loop to confirm the numbers still reflect reality.",sections:["reviewQueue","obligationReview","paymentReview","tensionSignals","weeklyReview"]},logbook:{title:"Records",copy:"Imports, transactions, matching evidence, cleanup, and detailed records.",sections:["ledger"]},settings:{title:"Settings",copy:"App behavior, local data and privacy, backup/restore, defaults, and display preferences.",sections:["data","settings"]}};return function(o){const c=n[o];return c?[t(c.title,c.copy),...c.sections.map(u=>e[u]())]:['<div class="fin-dashboard-main">',t("Money Status","Your current financial condition, safe-to-spend, runway, and next move."),e.observatoryHeader(),e.dashboardCockpit(),e.nextActions(),e.todaysDecision(),e.next30Days(),e.strategicPicture(),"</div>"]}}function v(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function $e(e){return String(e??"").replace(/\\/g,"\\\\").replace(/'/g,"\\'")}function en(e,t,n){const r=Number(e)||0;return`${r} ${r===1?t:n||`${t}s`}`}function mr(e){return[["all","All scopes"],["business","Business"],["personal","Personal"],["shared","Shared"]].map(([t,n])=>`<option value="${t}"${e===t?" selected":""}>${n}</option>`).join("")}function ke(e){const t=Date.parse(String(e||""));return Number.isFinite(t)?new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"Not yet"}function Me(e){return`<div class="fin-compact-empty">${v(e)}</div>`}function Br(e){const t=String(e||"").replace(/_/g," ");return t?t.charAt(0).toUpperCase()+t.slice(1):"Review"}function Ft(e){const t=String(e||"needs_review").toLowerCase();return`<span class="fin-status-pill fin-status-pill--${v(t)}">${v(Br(t))}</span>`}function pe({label:e,action:t="",args:n="",local:r=!1,variant:o="secondary",size:c="md",iconHtml:u="",extraClass:m="",attrs:f="",fullWidth:y=!1}={}){const h=t?r?`data-fin-action="${v(t)}"`:`data-action="${v(t)}"${n?` data-action-args="${v(n)}"`:""}`:"",b=["fin-button",`fin-button--${String(o||"secondary")}`,`fin-button--${String(c||"md")}`,y?"fin-button--full":"",m].filter(Boolean).join(" ");return`
        <button class="${v(b)}" type="button" ${h} ${f}>
            ${u||""}
            <span>${v(e||"Action")}</span>
        </button>
    `}function mn(e,t){const n=t||e||"widget";return`
        <button class="fin-info-button" type="button" data-fin-action="open-widget-info" data-widget-info-key="${v(e)}" aria-label="Explain ${v(n)}" title="Explain ${v(n)}">
            ?
        </button>
    `}function Si({eyebrow:e="",title:t="",subtitle:n="",actions:r=""}={}){return`
        <div class="fin-widget-header">
            <div class="fin-widget-header-copy">
                ${e?`<div class="fin-widget-eyebrow">${v(e)}</div>`:""}
                ${t?`<div class="widget-title ui-title">${v(t)}</div>`:""}
                ${n?`<div class="fin-helper-text">${v(n)}</div>`:""}
            </div>
            ${r?`<div class="fin-widget-header-actions">${r}</div>`:""}
        </div>
    `}function ii(e="",{align:t="end"}={}){return e?`<div class="fin-widget-footer fin-widget-footer--${v(t)}">${e}</div>`:""}function qt({title:e="",meta:t="",metaHtml:n="",amount:r="",amountClass:o="",rightHtml:c="",actionHtml:u="",iconHtml:m="",extraClass:f="",attrs:y=""}={}){return`
        <div class="fin-list-row ${v(f)}" ${y}>
            ${m?`<div class="fin-list-row-icon">${m}</div>`:""}
            <div class="fin-list-row-main">
                <div class="fin-list-row-title">${v(e||"Item")}</div>
                ${n?`<div class="fin-list-row-meta">${n}</div>`:t?`<div class="fin-list-row-meta">${v(t)}</div>`:""}
            </div>
            ${c||r||u?`
                <div class="fin-list-row-right">
                    ${c||(r?`<div class="fin-list-row-amount ${v(o)}">${v(r)}</div>`:"")}
                    ${u?`<div class="fin-list-row-action">${u}</div>`:""}
                </div>
            `:""}
        </div>
    `}function Ml({title:e="",sections:t=[],formulaHtml:n="",extraHtml:r=""}={}){return`
        <div class="fin-info-popover-backdrop" data-fin-action="close-widget-info">
            <aside class="fin-info-popover" role="dialog" aria-modal="true" aria-label="${v(e||"Widget information")}">
                <div class="fin-info-popover-header">
                    <div>
                        <div class="fin-widget-eyebrow">Help layer</div>
                        <h3>${v(e||"Widget information")}</h3>
                    </div>
                    <button class="fin-info-popover-close" type="button" data-fin-action="close-widget-info" aria-label="Close information">&times;</button>
                </div>
                <div class="fin-info-popover-body">
                    ${t.map(o=>`
                        <section class="fin-info-popover-section">
                            <h4>${v(o.label||"")}</h4>
                            <p>${v(o.body||"")}</p>
                        </section>
                    `).join("")}
                    ${n?`
                        <section class="fin-info-popover-section">
                            <h4>Formula</h4>
                            ${n}
                        </section>
                    `:""}
                    ${r||""}
                </div>
            </aside>
        </div>
    `}function Nl(e,t){return`
        <section class="fin-section fin-section-heading">
            <div class="fin-page-header">
                <h2 class="fin-page-title">${v(e)}</h2>
                <p class="fin-page-subtitle">${v(t)}</p>
            </div>
        </section>
    `}function Nn(e){return Array.isArray(e)?e:[]}function Ba(e){const t=Number(e);return Number.isFinite(t)?Math.round(t*100)/100:0}function Pt(e){if(typeof e=="string"&&/^\d{4}-\d{2}-\d{2}$/.test(e))return e;const t=new Date(e||"");return Number.isFinite(t.getTime())?t.toISOString().slice(0,10):""}function Dl(e,t){const n=new Date(e.getTime());return n.setUTCDate(n.getUTCDate()+t),n}function Cl(e,t){const n=Pt(t);if(!n)return null;const r=new Date(`${n}T12:00:00.000Z`),o=new Date(`${Pt(e)}T12:00:00.000Z`);return!Number.isFinite(r.getTime())||!Number.isFinite(o.getTime())?null:Math.floor((r.getTime()-o.getTime())/864e5)}function ai(e,t,n){const r=Cl(n,t.date);if(r==null||r<0||r>90)return;const o={...t,date:Pt(t.date),daysUntil:r,amount:Ba(t.amount)};r<=7&&e["7d"].push(o),r<=30&&e["30d"].push(o),e["90d"].push(o)}function Lr(e,t){const n=new Date(`${Pt(t)}T12:00:00.000Z`),r=Math.max(1,Math.min(28,Number(e&&e.dueDay)||n.getUTCDate()));for(let o=0;o<4;o+=1){const c=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth()+o,r,12));if(c>=n)return Pt(c)}return Pt(n)}function xl(e,t){return String(e&&e.planStatus||"")==="starts_later"&&e.startDate?Pt(e.startDate):e.dueDate?Pt(e.dueDate):Lr({dueDay:1},t)}function kl(e){const t=Number(e&&e.monthlyPressure);if(Number.isFinite(t)&&t>0)return t;const n=Number(e&&(e.paymentAmount??e.minimumPayment));return Number.isFinite(n)?Math.max(0,n):0}function Fl(e){return Pt(e&&(e.expectedDateISO||e.expectedDate||e.dueDate))}function Tl(e){const t=Number(e&&(e.value??e.amount)),n=Number(e&&e.probability),r=Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;return Ba((Number.isFinite(t)?t:0)*r)}function ya(e){const t=new Set;return Nn(e).filter(n=>{const r=`${n.sourceType||""}:${n.sourceId||n.id||""}:${n.date||""}:${n.amount||0}`;return t.has(r)?!1:(t.add(r),!0)}).sort((n,r)=>n.date!==r.date?String(n.date).localeCompare(String(r.date)):Math.abs(Number(r.amount)||0)-Math.abs(Number(n.amount)||0))}function Ur({readModel:e={},treasury:t={},decisionEngine:n=null,nowIso:r=new Date().toISOString()}={}){const o=Pt(r)||Pt(new Date),c={"7d":[],"30d":[],"90d":[]};Nn(e.recurringExpenses).forEach(m=>{m&&m.active===!1||ai(c,{id:String(m.id||`expense-${m.category||""}`),sourceId:String(m.id||""),sourceType:"recurring_cost",kind:"Recurring cost",label:String(m.category||"Recurring cost"),date:Lr(m,o),amount:-Math.abs(Number(m.monthlyAmount)||0),route:"plan"},o)}),Nn(e.debtAccounts).forEach(m=>{if(!m||m.active===!1)return;const f=String(m.planStatus||"");if(f==="archived"||f==="completed")return;const y=kl(m);if(f==="missing"&&y<=0){ai(c,{id:String(m.id||`debt-${m.name||""}`),sourceId:String(m.id||""),sourceType:"debt_plan",kind:"Debt plan review",label:String(m.name||"Debt plan"),date:o,amount:0,route:"plan"},o);return}y<=0&&f!=="starts_later"||ai(c,{id:String(m.id||`debt-${m.name||""}`),sourceId:String(m.id||""),sourceType:"debt_plan",kind:f==="starts_later"?"Debt starts":"Debt plan",label:String(m.name||"Debt plan"),date:xl(m,o),amount:-Math.abs(y),route:"plan"},o)}),Nn(e.pipelineDeals).forEach(m=>{const f=String(m&&m.status||"").toLowerCase();if(["paid","cancelled","lost"].includes(f))return;const y=Fl(m);if(!y)return;const h=Tl(m);h<=0||ai(c,{id:String(m.id||`income-${m.title||""}`),sourceId:String(m.id||""),sourceType:"income",kind:"Expected income",label:String(m.title||m.client||"Expected income"),date:y,amount:h,route:"flow"},o)}),Nn(t.obligations).forEach(m=>{if(String(m&&m.status||"").toLowerCase()==="paid")return;const y=Pt(m&&m.dueDate);if(!y)return;const h=String(m&&m.type||"").toLowerCase();ai(c,{id:String(m.id||`obligation-${m.title||""}`),sourceId:String(m.sourceId||m.id||""),sourceType:h==="recurring_cost"?"recurring_cost":h==="debt"?"debt_plan":"obligation",kind:h==="recurring_cost"?"Recurring cost":h==="debt"?"Debt plan":"Obligation",label:String(m.title||"Obligation"),date:y,amount:-Math.abs(Number(m.amount)||0),route:"review"},o)}),Nn(e.reserveBuckets).forEach(m=>{if(!m||m.active===!1)return;const f=Number(m.targetAmount)||0,y=Number(m.currentAmount)||0,h=Math.max(0,f-y);h<=0||ai(c,{id:String(m.id||`reserve-${m.name||""}`),sourceId:String(m.id||""),sourceType:"reserve",kind:"Reserve gap",label:String(m.name||"Reserve bucket"),date:Pt(Dl(new Date(`${o}T12:00:00.000Z`),30)),amount:-Ba(h),route:"plan"},o)});const u=new Map(Nn(n&&n.weeklyFocus).map(m=>[String(m.sourceCardId||""),m]));return Nn(n&&n.decisionCards).forEach(m=>{const f=u.get(String(m.id||""));f&&Object.keys(c).forEach(y=>{c[y].forEach(h=>{!h.focusId&&String(h.sourceId||"")&&String(m.relatedId||"")===String(h.sourceId)&&(h.focusId=f.id,h.focusLabel=f.title)})})}),c["7d"]=ya(c["7d"]),c["30d"]=ya(c["30d"]),c["90d"]=ya(c["90d"]),c}function Cn(e){return Array.isArray(e)?e:[]}function Se(e){return Math.round((Number(e)||0)*100)/100}function Dn(e){const t=String(e||"");if(/^\d{4}-\d{2}-\d{2}/.test(t))return t.slice(0,10);const n=Date.parse(t);return Number.isFinite(n)?new Date(n).toISOString().slice(0,10):""}function Bi(e,t){const n=Date.parse(`${Dn(e)}T00:00:00.000Z`),r=Date.parse(`${Dn(t)}T00:00:00.000Z`);return!Number.isFinite(n)||!Number.isFinite(r)?null:Math.floor((n-r)/(1440*60*1e3))}function El(e){const t=String(e||"monthly").toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return t==="annual"||t==="annually"?"yearly":t==="every_two_weeks"||t==="two_weekly"||t==="fortnightly"?"biweekly":["weekly","biweekly","monthly","quarterly","yearly"].includes(t)?t:"monthly"}function Pl(e,t){const n=Math.max(0,Number(e)||0),r=El(t);return Se(r==="weekly"?n*52/12:r==="biweekly"?n*26/12:r==="quarterly"?n/3:r==="yearly"?n/12:n)}function Rl(e){const t=Number(e&&e.customMonthlyPressure);if(Number.isFinite(t)&&t>0)return Se(t);const n=Number(e&&(e.monthlyPressure||e.minimumPaymentMonthly));return Number.isFinite(n)&&n>0?Se(n):Pl(e&&(e.paymentAmount??e.minimumPayment),e&&(e.paymentFrequency||e.frequency))}function zr(e){const t=String(e&&(e.status||e.stage)||"").toLowerCase();return!["paid","received","settled","cancelled","lost","deleted"].includes(t)}function Ol(e){const t=Number(e&&e.probability);if(Number.isFinite(t))return Math.max(0,Math.min(1,t));const n=String(e&&(e.status||e.stage)||"expected").toLowerCase();return["confirmed","invoiced","due","overdue"].includes(n)?.9:n==="proposal"?.4:n==="lead"?.15:.6}function _l(e){return e==="Plan"||e==="Money Plan"?"plan":e==="Flow"||e==="Cash Timeline"?"flow":e==="Radar"||e==="Risk Radar"?"radar":e==="Review"||e==="Reality Check"?"review":"decisions"}function Vt(e){const t=e.severity||"info",n=e.source||"Decision Lab";return{id:e.id,title:e.title,status:e.status||t,urgency:e.urgency||t,severity:t,affectedMetric:e.affectedMetric||"",explanation:e.explanation||e.why||"",sourceData:e.sourceData||"",suggestedAction:e.suggestedAction||"Review this decision.",actionLabel:e.actionLabel||"Review",actionRoute:e.actionRoute||_l(n),optionalScenario:!!e.optionalScenario,metricImpact:e.metricImpact||"",sourceIds:Cn(e.sourceIds).map(String),trigger:e.trigger||e.id,why:e.why||e.explanation||"",source:n}}function Li(e){return{critical:5,high:4,warning:3,medium:2,info:1,opportunity:0}[String(e||"").toLowerCase()]||0}function Ui(e,t,n){if(n==null||n<0)return;const r={id:t.id,label:t.label,date:t.date,amount:Se(t.amount||0),kind:t.kind,sourceId:t.sourceId||t.id};n<=7&&e["7d"].push(r),n<=30&&e["30d"].push(r),n<=90&&e["90d"].push(r)}function jl(e){return Cn(e&&e.pipelineDeals).some(t=>{const n=String(t&&t.scope||"business").toLowerCase();return zr(t)&&(n==="business"||n==="shared")})||Cn(e&&e.transactions).some(t=>{const n=String(t&&t.scope||"").toLowerCase();return String(t&&t.type)==="income.received"&&(n==="business"||n==="shared")})}function Bl(e){const t=Cn(e&&e.reserveBuckets).filter(o=>{const c=`${o&&o.name||""} ${o&&o.purpose||""} ${o&&o.bucket||""}`.toLowerCase();return o&&o.active!==!1&&(c.includes("tax")||c.includes("vat"))}),n=t.reduce((o,c)=>o+Math.max(0,Number(c.currentAmount??c.amount)||0),0),r=t.reduce((o,c)=>o+Math.max(0,Number(c.targetAmount)||0),0);return{buckets:t,current:Se(n),target:Se(r),gap:Se(Math.max(0,r-n))}}function Ll(e){return{id:`focus-${e.id}`,title:e.suggestedAction,reason:e.why||e.explanation,urgency:e.urgency,sourceCardId:e.id,actionLabel:e.actionLabel,actionRoute:e.actionRoute}}function pr({readModel:e={},snapshot:t={},treasury:n={},forecast:r={},roadmapMetrics:o={},reviewState:c={},settings:u={},nowIso:m=new Date().toISOString()}={}){const f=Dn(m)||new Date().toISOString().slice(0,10),y=Number((n&&n.actualCash)??(t&&t.realBalance)??0),h=Number((n&&n.availableCash)??(t&&t.availableCash)??y),b=Number((n&&n.safeToSpend)??(t&&t.safeToSpend)??h),_=Math.max(0,Number((n&&n.totalMonthlyBurn)??(t&&t.monthlyBurn)??0)||0),B=Number((n&&n.runwayMonths)??(t&&t.runwayMonths)),N=Math.max(0,Number((n&&n.confirmedShortTermObligations)??(n&&n.committedShortTermObligations)??0)||0);Math.max(0,Number(n&&n.minimumBuffer)||0);const x=Math.max(0,Number(r&&r.byHorizon&&r.byHorizon[30]&&r.byHorizon[30].components&&r.byHorizon[30].components.expectedIncome)||0),q=[],H=[],fe=[],J={"7d":[],"30d":[],"90d":[]},K=String(u&&u.riskTolerance||"balanced"),W=O=>{q.push(O),H.push(O)},re=O=>{q.push(O),fe.push(O)};(b<0||h<0)&&W(Vt({id:"negative-safe-cash",title:"Near-term cash is overcommitted",severity:"critical",affectedMetric:"Safe-to-Spend",explanation:"Available cash or Safe-to-Spend is below zero after protected cash and confirmed pressure.",why:"The current cash position cannot cover the visible near-term commitments.",sourceData:`Safe-to-Spend ${Se(b)} · Available cash ${Se(h)}`,suggestedAction:"Protect liquidity before optional spending.",actionLabel:"Open Money Plan",actionRoute:"plan",metricImpact:`${Se(Math.min(b,h))}`,trigger:"negative-safe-to-spend-or-available-cash",source:"Money Plan"})),Number.isFinite(B)&&B<1&&W(Vt({id:"low-runway-critical",title:"Runway is below one month",severity:"critical",affectedMetric:"Runway",explanation:"Available cash covers less than one month at the current monthly burn.",why:"Runway below one month leaves little room for delayed income or surprise obligations.",sourceData:`${Se(B)} months`,suggestedAction:"Reduce burn or collect confirmed revenue this week.",actionLabel:"Open Cash Timeline",actionRoute:"flow",metricImpact:`${Se(B)} months`,trigger:"runway-under-one-month",source:"Cash Timeline"})),b>0&&Number.isFinite(B)&&B<2&&W(Vt({id:"safe-spend-runway-mismatch",title:"Safe-to-Spend is positive but runway is weak",severity:"warning",affectedMetric:"Runway",explanation:"The short-term spending number is positive, but the medium-term runway is still thin.",why:"Available cash may cover the next 30 days while recurring pressure still drains the next months.",sourceData:`Safe-to-Spend ${Se(b)} · runway ${Se(B)} months`,suggestedAction:"Favor cash-preserving choices until runway is above two months.",actionLabel:"Open Cash Timeline",actionRoute:"flow",metricImpact:`${Se(B)} months`,trigger:"safe-to-spend-positive-runway-under-two",source:"Cash Timeline"})),N>Math.max(0,b)&&W(Vt({id:"overloaded-month",title:"The next 30 days are overloaded",severity:"high",affectedMetric:"30-day obligations",explanation:"Confirmed obligations due soon exceed the current Safe-to-Spend amount.",why:"The month needs a liquidity decision before new optional spending.",sourceData:`${Se(N)} due · ${Se(b)} safe`,suggestedAction:"Delay optional spending or pull confirmed income forward.",actionLabel:"Open Reality Check",actionRoute:"review",metricImpact:`${Se(N-Math.max(0,b))} gap`,trigger:"thirty-day-obligations-exceed-safe-cash",source:"Reality Check"})),Cn(e&&e.obligations).forEach(O=>{const U=Dn(O&&O.dueDate),V=Bi(U,f);Ui(J,{id:`obligation-${O&&O.id}`,label:String(O&&O.title||"Obligation"),date:U,amount:Number(O&&O.amount)||0,kind:"Obligation",sourceId:O&&O.id},V)}),Cn(e&&e.recurringExpenses).forEach(O=>{const U=Math.max(1,Math.min(28,Number(O&&O.dueDay)||1)),V=new Date(`${f}T12:00:00.000Z`),R=new Date(Date.UTC(V.getUTCFullYear(),V.getUTCMonth(),U,12));Dn(R)<f&&R.setUTCMonth(R.getUTCMonth()+1);const Y=Dn(R);Ui(J,{id:`recurring-${O&&O.id}`,label:String(O&&O.category||"Recurring cost"),date:Y,amount:Number(O&&O.monthlyAmount)||Number(O&&O.amount)||0,kind:"Recurring cost",sourceId:O&&O.id},Bi(Y,f))}),Cn(e&&e.debtAccounts).forEach(O=>{const U=Number(O&&O.outstanding)||0;if(U<=0)return;const V=String(O&&O.planStatus||"missing"),R=Rl(O),Y=Dn(O&&O.startDate),oe=Bi(Y,f);V==="starts_later"&&Y&&(Ui(J,{id:`debt-start-${O&&O.id}`,label:`${O&&O.name||"Debt plan"} starts`,date:Y,amount:R,kind:"Debt starts",sourceId:O&&O.id},oe),oe!=null&&oe>=0&&oe<=30&&W(Vt({id:`debt-starts-${O&&O.id}`,title:"Payment pressure starts soon",severity:"warning",affectedMetric:"Monthly burn",explanation:`${O&&O.name||"A debt plan"} starts within 30 days and will add visible payment pressure.`,why:"A future-starting debt plan is not current burn yet, but it is close enough to plan around.",sourceData:`${Y} · ${Se(R)} / month`,suggestedAction:"Review the payment plan before it becomes active.",actionLabel:"Open debt plan",actionRoute:"plan",metricImpact:`+${Se(R)} monthly pressure`,sourceIds:[O&&O.id],trigger:"debt-starts-within-thirty-days",source:"Money Plan",optionalScenario:!0}))),V==="on_hold"&&W(Vt({id:`debt-on-hold-${O&&O.id}`,title:"Paused debt is hidden pressure",severity:"info",affectedMetric:"Debt pressure",explanation:`${O&&O.name||"A debt"} is on hold, so it is excluded from monthly burn today.`,why:"Paused debt is still a liability and should be reviewed before it quietly returns.",sourceData:`${Se(U)} outstanding · ${Se(R)} potential monthly pressure`,suggestedAction:"Set a review date or confirm the hold.",actionLabel:"Open debt planner",actionRoute:"plan",metricImpact:`${Se(R)} hidden monthly pressure`,sourceIds:[O&&O.id],trigger:"paused-debt-hidden-pressure",source:"Money Plan"})),V==="irregular"&&R<=0&&W(Vt({id:`debt-irregular-${O&&O.id}`,title:"Irregular debt pressure needs a monthly estimate",severity:"info",affectedMetric:"Debt pressure",explanation:`${O&&O.name||"A debt"} is irregular without custom monthly pressure.`,why:"The liability is visible, but its monthly pressure cannot influence decisions until estimated.",sourceData:`${Se(U)} outstanding`,suggestedAction:"Add a custom monthly pressure estimate.",actionLabel:"Open debt planner",actionRoute:"plan",metricImpact:"Hidden pressure",sourceIds:[O&&O.id],trigger:"irregular-debt-without-pressure",source:"Money Plan"})),V==="missing"&&W(Vt({id:`debt-missing-plan-${O&&O.id}`,title:"Debt exists without a payment plan",severity:"warning",affectedMetric:"Monthly burn",explanation:`${O&&O.name||"A debt"} has outstanding balance without normalized payment behavior.`,why:"Long-term pressure is hidden until the debt has a payment plan.",sourceData:`${Se(U)} outstanding`,suggestedAction:"Add a payment plan so burn and runway stay accurate.",actionLabel:"Add payment plan",actionRoute:"plan",metricImpact:"Unknown monthly pressure",sourceIds:[O&&O.id],trigger:"missing-debt-payment-plan",source:"Money Plan"}))});const le=Bl(e);jl(e)&&(!le.buckets.length||le.gap>0||le.target>0&&le.current/le.target<.5)&&W(Vt({id:"tax-reserve-underfunded",title:"Tax reserve may be underfunded",severity:le.buckets.length?"warning":"info",affectedMetric:"Protected cash",explanation:le.buckets.length?"A tax or VAT reserve exists but is below target.":"Business income is visible but no tax or VAT reserve target is active.",why:"Unreserved tax money can make cash look safer than it is.",sourceData:`${Se(le.current)} protected · ${Se(le.target)} target`,suggestedAction:"Allocate part of incoming business revenue to tax/VAT reserve.",actionLabel:"Open Money Plan",actionRoute:"plan",metricImpact:`${Se(le.gap)} reserve gap`,trigger:"business-income-with-tax-reserve-gap",source:"Money Plan"})),y>0&&_>0&&x>0&&_>x&&W(Vt({id:"positive-cash-negative-structure",title:"Cash looks healthy but structure is weak",severity:"warning",affectedMetric:"Monthly burn",explanation:"Total cash is positive, but monthly burn is higher than expected 30-day income.",why:"The current balance may hide a weak operating structure.",sourceData:`${Se(_)} burn · ${Se(x)} expected income`,suggestedAction:"Review recurring burn and near-term revenue coverage.",actionLabel:"Open Risk Radar",actionRoute:"radar",metricImpact:`${Se(_-x)} monthly structure gap`,trigger:"positive-cash-high-burn-relative-revenue",source:"Risk Radar"})),Cn(e&&e.pipelineDeals).filter(zr).forEach(O=>{const U=Math.max(0,Number(O&&(O.value??O.amount))||0);if(U<=0)return;const V=Ol(O),R=Se(U*V),Y=_>0?Se(R/_):null,oe=Dn(O&&O.expectedDateISO),de=Bi(oe,f);oe&&Ui(J,{id:`income-${O&&O.id}`,label:String(O&&(O.title||O.client||O.name)||"Expected income"),date:oe,amount:R,kind:"Expected income",sourceId:O&&O.id},de);const xe=b<0||Number.isFinite(B)&&B<3||N>Math.max(0,b);Y!=null&&(Y>=.5||xe)&&re(Vt({id:`opportunity-${O&&O.id}`,title:`${O&&(O.title||O.client||O.name)||"Opportunity"} could extend runway`,severity:"opportunity",affectedMetric:"Runway",explanation:`Expected value could add about ${Y.toFixed(1)} months of runway at current burn.`,why:xe?"This opportunity helps the current pressure point.":"The opportunity meaningfully improves the runway picture.",sourceData:`${Se(R)} expected value · ${Math.round(V*100)}% confidence`,suggestedAction:"Follow up while it can still affect the forecast.",actionLabel:"Open Cash Timeline",actionRoute:"flow",metricImpact:`+${Y.toFixed(1)} months runway`,sourceIds:[O&&O.id],trigger:"opportunity-runway-impact",source:"Cash Timeline",optionalScenario:!0}))});const Ne=Date.parse(String(c&&c.lastReviewedAt||""));Number.isFinite(Ne)||W(Vt({id:"weekly-review-due",title:"Weekly money check is due",severity:"info",affectedMetric:"Data quality",explanation:"No recent checkpoint is saved for the current operating picture.",why:"Manual finance data stays trustworthy when cash accounts and assumptions are reviewed.",sourceData:"No saved checkpoint",suggestedAction:"Run the weekly review and choose this week’s focus.",actionLabel:"Open Reality Check",actionRoute:"review",metricImpact:"Improves confidence",trigger:"weekly-review-not-current",source:"Reality Check"})),q.sort((O,U)=>Li(U.severity)-Li(O.severity));const Ae=q.filter(O=>O.severity!=="opportunity").slice(0,3).map(Ll);let C={key:"stable",label:"Stable",severity:"info",explanation:"No major decision pressure is visible in the current local data.",primaryMetric:Number.isFinite(B)?`${Se(B)} months runway`:`${Se(b)} Safe-to-Spend`,riskTolerance:K};const F=q[0];F&&(F.id==="negative-safe-cash"?C={key:"critical",label:"Critical",severity:"critical",explanation:F.why,primaryMetric:F.sourceData,riskTolerance:K}:F.id==="low-runway-critical"?C={key:"critical-runway",label:"Critical",severity:"critical",explanation:F.why,primaryMetric:F.sourceData,riskTolerance:K}:F.id==="safe-spend-runway-mismatch"?C={key:"fragile",label:"Fragile",severity:"warning",explanation:F.why,primaryMetric:F.sourceData,riskTolerance:K}:F.id==="overloaded-month"?C={key:"tight",label:"Tight but manageable",severity:"high",explanation:F.why,primaryMetric:F.sourceData,riskTolerance:K}:F.severity==="opportunity"?C={key:"opportunity-window",label:"Opportunity window",severity:"opportunity",explanation:F.why,primaryMetric:F.metricImpact,riskTolerance:K}:C={key:"watchful",label:"Needs attention",severity:F.severity,explanation:F.why,primaryMetric:F.sourceData,riskTolerance:K});const Q=[{id:"late-payment",label:"What if I get paid late?",route:"flow",mode:"display_only"},{id:"pause-debt",label:"What if I pause this debt?",route:"plan",mode:"display_only"},{id:"book-project",label:"What if I book one €3,000 project?",route:"flow",mode:"display_only"},{id:"tax-reserve",label:"What if I reserve 30% for tax?",route:"plan",mode:"display_only"},{id:"reduce-burn",label:"What if I reduce burn by €300/month?",route:"radar",mode:"display_only"}],X=Ur({readModel:e,treasury:n,decisionEngine:{weeklyFocus:Ae,decisionCards:q},nowIso:m});return{generatedAt:m,status:C,weeklyFocus:Ae,decisionCards:q.slice(0,12),warnings:H.sort((O,U)=>Li(U.severity)-Li(O.severity)).slice(0,8),opportunities:fe.slice(0,6),pressureTimeline:X||J,scenarioShortcuts:Q}}function qr(e){return Array.isArray(e)?e:[]}function Ce(e){const t=Number(e);return Number.isFinite(t)?Math.round(t*100)/100:0}function tn(e,t,n=0){for(const r of t){const o=Number(e&&e[r]);if(Number.isFinite(o))return o}return n}function Ul(e){const t=String(e||"").trim().toLowerCase();return["reduce_flexible_costs","reduce_debt_pressure","add_recurring_income","protect_future_income","pause_savings_goal","increase_reserve_contribution"].includes(t)?t:"reduce_flexible_costs"}function xa(e,t=0){const n=Ul(e&&e.type),r=Math.max(0,Number(e&&e.amount)||0),o=new Date().toISOString();return{id:String(e&&e.id||`scenario-${n}-${t}`),name:String(e&&e.name||zl(n)),type:n,amount:r,protectPercent:Math.max(0,Math.min(100,Number(e&&e.protectPercent)||0)),createdAt:String(e&&e.createdAt||o),updatedAt:String(e&&e.updatedAt||o)}}function zl(e){return{reduce_flexible_costs:"Reduce flexible costs",reduce_debt_pressure:"Reduce debt pressure",add_recurring_income:"Add recurring income",protect_future_income:"Protect future income",pause_savings_goal:"Pause savings goal",increase_reserve_contribution:"Increase reserve contribution"}[e]||"Scenario"}function ql({snapshot:e={},treasury:t={}}){const n=tn(t,["availableCash"],tn(e,["availableCash","trulyAvailableCash"],0)),r=tn(t,["safeToSpend"],tn(e,["safeToSpend"],n)),o=Math.max(0,tn(t,["totalMonthlyBurn"],tn(e,["monthlyBurn"],0))),c=Math.max(0,tn(t,["debtMonthlyPressure","debtPaymentsDueSoon"],tn(e,["debtPaymentsDueSoon"],0))),u=Math.max(0,tn(t,["protectedCash"],tn(e,["reservedCash"],0))),m=Math.max(0,tn(t,["reserveGap"],0)),f=o>0?Ce(n/o):null;return{safeToSpend:Ce(r),availableCash:Ce(n),monthlyBurn:Ce(o),runway:f,debtPressure:Ce(c),reserveGap:Ce(m),protectedCash:Ce(u)}}function Vl(e,t){const n={...e},r=Math.max(0,Number(t&&t.amount)||0);if(t.type==="reduce_flexible_costs"){const o=Math.min(r,n.monthlyBurn);n.monthlyBurn=Ce(n.monthlyBurn-o),n.safeToSpend=Ce(n.safeToSpend+o)}if(t.type==="reduce_debt_pressure"){const o=Math.min(r,n.debtPressure);n.debtPressure=Ce(n.debtPressure-o),n.monthlyBurn=Ce(Math.max(0,n.monthlyBurn-o)),n.safeToSpend=Ce(n.safeToSpend+o)}if(t.type==="add_recurring_income"&&(n.safeToSpend=Ce(n.safeToSpend+r),n.availableCash=Ce(n.availableCash+r)),t.type==="protect_future_income"){const o=Ce(r*((Number(t.protectPercent)||0)/100));n.safeToSpend=Ce(n.safeToSpend-o),n.availableCash=Ce(n.availableCash-o),n.protectedCash=Ce(n.protectedCash+o),n.reserveGap=Ce(Math.max(0,n.reserveGap-o))}return t.type==="pause_savings_goal"&&(n.safeToSpend=Ce(n.safeToSpend+r),n.availableCash=Ce(n.availableCash+r)),t.type==="increase_reserve_contribution"&&(n.safeToSpend=Ce(n.safeToSpend-r),n.availableCash=Ce(n.availableCash-r),n.protectedCash=Ce(n.protectedCash+r),n.reserveGap=Ce(Math.max(0,n.reserveGap-r))),n.runway=n.monthlyBurn>0?Ce(n.availableCash/n.monthlyBurn):null,n}function Hl(e,t){return{safeToSpend:Ce(t.safeToSpend-e.safeToSpend),availableCash:Ce(t.availableCash-e.availableCash),monthlyBurn:Ce(t.monthlyBurn-e.monthlyBurn),runway:e.runway==null||t.runway==null?null:Ce(t.runway-e.runway),debtPressure:Ce(t.debtPressure-e.debtPressure),reserveGap:Ce(t.reserveGap-e.reserveGap)}}function Wl(e){const t=e.runway==null?0:e.runway*100;return Ce(t+e.safeToSpend+Math.abs(Math.min(0,e.monthlyBurn))+Math.abs(Math.min(0,e.debtPressure))+Math.abs(Math.min(0,e.reserveGap)))}function Gl(e,t,n){const r=[];return t.safeToSpend<0&&r.push("This scenario leaves Safe-to-Spend below zero."),t.availableCash<0&&r.push("This scenario leaves available cash below zero."),n.type==="protect_future_income"&&!n.protectPercent&&r.push("Choose a protection percentage to model future-income reserves."),n.type==="increase_reserve_contribution"&&e.reserveGap<=0&&r.push("Reserve gap is already closed in the current model."),r}function Kl(e,t,n){const r=xa(t,n),o=Vl(e,r),c=Hl(e,o);return{...r,base:e,adjusted:o,delta:c,impactScore:Wl(c),warnings:Gl(e,o,r)}}function Yl({base:e,forecast:t={},decisionEngine:n={}}){const r=Number(t&&t.byHorizon&&t.byHorizon[30]&&t.byHorizon[30].components&&t.byHorizon[30].components.expectedIncome)||0,o=qr(n&&n.warnings).length?250:150;return[{id:"scenario-flex-cut",type:"reduce_flexible_costs",name:"Reduce flexible costs",amount:Math.min(Math.max(e.monthlyBurn*.08,o),500)},{id:"scenario-debt-pressure",type:"reduce_debt_pressure",name:"Reduce debt pressure",amount:Math.min(Math.max(e.debtPressure*.25,100),e.debtPressure||250)},{id:"scenario-income",type:"add_recurring_income",name:"Add recurring income",amount:Math.max(1e3,Math.min(3e3,r||1500))},{id:"scenario-protect-income",type:"protect_future_income",name:"Protect future income",amount:Math.max(1e3,r||1500),protectPercent:25},{id:"scenario-pause-savings",type:"pause_savings_goal",name:"Pause savings goal",amount:250},{id:"scenario-reserve",type:"increase_reserve_contribution",name:"Increase reserve contribution",amount:Math.min(Math.max(e.reserveGap*.2,100),500)}]}function fr({readModel:e={},snapshot:t={},treasury:n={},forecast:r={},decisionEngine:o={},savedScenarios:c=[],nowIso:u=new Date().toISOString()}={}){const m=ql({snapshot:t,treasury:n}),f=qr(c).map(xa),y=Yl({base:m,forecast:r,decisionEngine:o}),h=y.concat(f).map((b,_)=>Kl(m,b,_));return h.sort((b,_)=>_.impactScore-b.impactScore||String(b.name).localeCompare(String(_.name))),{generatedAt:u,base:m,recommended:y.map(xa),saved:f,comparable:h,topScenario:h[0]||null,warnings:h.flatMap(b=>b.warnings.map(_=>({scenarioId:b.id,warning:_}))).slice(0,6)}}window.FinancialMode=(function(){let e=null,t=null,n=null,r=null,o=null,c={},u=null,m=null,f=null,y=null,h={"7d":[],"30d":[],"90d":[]},b=!1,_=!1,B="",N="",x="",q="";const H={focusMode:"finance-master.layout.focus-mode",pipelineTab:"finance-master.layout.pipeline-tab",ledgerView:"finance-master.layout.ledger-view",ledgerFilters:"finance-master.layout.ledger-filters",selectedTransaction:"finance-master.layout.selected-transaction",invoicesView:"finance-master.layout.invoices-view",treasuryProject:"finance-master.layout.treasury-project",activeSection:"finance-master.layout.active-section"},fe=["dashboard","decisions","flow","plan","radar","review","logbook","settings"],J=[["reduce_flexible_costs","Reduce flexible costs"],["reduce_debt_pressure","Reduce debt pressure"],["add_recurring_income","Add recurring income"],["protect_future_income","Protect future income"],["pause_savings_goal","Pause savings goal"],["increase_reserve_contribution","Increase reserve contribution"]],K={overview:"dashboard",today:"dashboard",pulse:"dashboard",decisions:"decisions",decision:"decisions",cockpit:"decisions",flow:"flow",cashflow:"flow",planning:"flow",income:"flow",invoices:"flow",transactions:"logbook",ledger:"logbook","cash-movement":"logbook",cashmovement:"logbook",cashMovement:"logbook",logbook:"logbook",review:"review","monthly-review":"review",monthlyreview:"review",monthlyReview:"review","month-close":"review",monthclose:"review",monthClose:"review",plan:"plan",map:"plan",treasury:"plan",reserves:"plan",obligations:"plan",fixedcosts:"plan",fixedCosts:"plan",radar:"radar",signals:"radar",reports:"radar",insights:"radar",system:"settings",data:"settings",import:"settings",backup:"settings",settings:"settings"},W={container:document.getElementById("dashboard-financial"),content:document.getElementById("fin-content-area"),switchBtns:document.querySelectorAll(".fin-switch-btn"),mobileNavToggle:document.querySelector('[data-action="FinancialMode.toggleMobileNav"]'),sidebar:document.querySelector(".finance-master-sidebar")};function re(i){return`finance-master.layout.collapsed.${String(i||"").trim()}`}function le(i,a){try{const s=localStorage.getItem(i);if(s==null)return!!a;if(s==="true")return!0;if(s==="false")return!1}catch{}return!!a}function Ne(i,a){try{localStorage.setItem(i,a?"true":"false")}catch{}}function Ae(i){const a=String(i||"dashboard").trim(),s=a.toLowerCase(),g=K[a]||K[s]||a;return fe.indexOf(g)!==-1?g:"dashboard"}function C(){return le(H.focusMode,!1)}function F(i){Ne(H.focusMode,!!i)}function Q(){try{const i=String(localStorage.getItem(H.pipelineTab)||"pipeline").toLowerCase();if(i==="pipeline"||i==="history"||i==="cashflow")return i}catch{}return"pipeline"}function X(i){const a=String(i||"").toLowerCase();if(!(a!=="pipeline"&&a!=="history"&&a!=="cashflow"))try{localStorage.setItem(H.pipelineTab,a)}catch{}}function O(){try{return Ae(localStorage.getItem(H.activeSection)||"dashboard")}catch{return"dashboard"}}function U(i){const a=Ae(i);q="";try{localStorage.setItem(H.activeSection,a)}catch{}He(),ve()}function V(){try{const i=String(localStorage.getItem(H.ledgerView)||"clean").toLowerCase();if(i==="clean"||i==="work"||i==="expected"||i==="matched")return i}catch{}return"clean"}function R(i){const a=String(i||"clean").toLowerCase();if(!(a!=="clean"&&a!=="work"&&a!=="expected"&&a!=="matched"))try{localStorage.setItem(H.ledgerView,a)}catch{}}function Y(){try{const i=String(localStorage.getItem(H.invoicesView)||"open").toLowerCase();if(i==="cashflow")return"rhythm";if(i==="open"||i==="settled"||i==="all"||i==="rhythm")return i}catch{}return"open"}function oe(i){const a=String(i||"open").toLowerCase();if(!(a!=="open"&&a!=="settled"&&a!=="all"&&a!=="rhythm"))try{localStorage.setItem(H.invoicesView,a)}catch{}}function de(){try{return String(localStorage.getItem(H.treasuryProject)||"all").trim()||"all"}catch{return"all"}}function xe(i){const a=String(i||"all").trim()||"all";try{localStorage.setItem(H.treasuryProject,a)}catch{}}function Z(){return{search:"",accountId:"all",scope:"all",categoryId:"",type:"all",reviewStatus:"all",source:"all",importBatchId:"all",linkState:"all",amountMin:"",amountMax:"",dateFrom:"",dateTo:""}}function Rt(){try{const i=JSON.parse(localStorage.getItem(H.ledgerFilters)||"{}");return Object.assign(Z(),i&&typeof i=="object"?i:{})}catch{return Z()}}function Wt(i){try{localStorage.setItem(H.ledgerFilters,JSON.stringify(Object.assign(Z(),i||{})))}catch{}}function _e(){try{localStorage.removeItem(H.ledgerFilters)}catch{}}function et(){try{return String(localStorage.getItem(H.selectedTransaction)||"").trim()}catch{return""}}function st(i){try{i?localStorage.setItem(H.selectedTransaction,String(i)):localStorage.removeItem(H.selectedTransaction)}catch{}}function Ot(i){const a=G(e&&e.fiatAccounts);return[`<option value="all"${i==="all"||!i?" selected":""}>All accounts</option>`,...a.map(s=>`<option value="${v(s.id)}"${String(i)===String(s.id)?" selected":""}>${v(s.name||"Account")}</option>`)].join("")}function on(i){document.querySelectorAll("[data-fin-nav]").forEach(a=>{const s=String(a.getAttribute("data-fin-nav")||"")===i;a.classList.toggle("active",s),a.setAttribute("aria-current",s?"page":"false")})}function Nt(i){return`
            <button type="button" data-action="${v(i.action)}"${i.args?` data-action-args="${v(i.args)}"`:""}>
                <strong>${v(i.label)}</strong>
                <span>${v(i.copy)}</span>
            </button>
        `}function _t(i){const a=document.querySelector(".fin-fab-add"),s=document.getElementById("quick-action-menu");if(!a||!s)return;const l=[{key:"transaction",label:"Add transaction",copy:"Record income, expense, or transfer",action:"openEditModal",args:"'transaction', 'expense'"},{key:"income",label:"Add expected income",copy:"Invoice, retainer, or likely payment",action:"openEditModal",args:"'income'"},{key:"cash",label:"Add cash account",copy:"Track a real liquid balance",action:"openEditModal",args:"'fiatAccount'"},{key:"cost",label:"Add recurring cost",copy:"Add pressure to monthly burn",action:"openEditModal",args:"'expense'"},{key:"debt",label:"Add debt item",copy:"Track liability and payment plan",action:"FinancialMode.openAddModal",args:"'debtAdd'"},{key:"reserve",label:"Add reserve bucket",copy:"Protect tax, VAT, health, or buffer cash",action:"openEditModal",args:"'reserveBucket'"},{key:"import",label:"Import CSV",copy:"Bring in local transaction records",action:"openEditModal",args:"'csvImport'"}],g={dashboard:["transaction","income","cash","cost","debt","reserve","import"],decisions:["income","cost","debt","reserve","transaction","cash","import"],flow:["income","cost","transaction","import","cash","debt","reserve"],logbook:["transaction","import","income","cash","cost","debt","reserve"],plan:["cash","cost","debt","reserve","income","transaction","import"],radar:["debt","reserve","income","cost","cash","transaction","import"],review:["transaction","income","cost","debt","reserve","cash","import"],settings:["import","transaction","income","cash","cost","debt","reserve"]},S=g[i]||g.dashboard,$=new Map(S.map((D,z)=>[D,z])),w=l.slice().sort((D,z)=>($.get(D.key)??99)-($.get(z.key)??99));a.classList.toggle("fin-fab-add--hidden",w.length===0),a.setAttribute("aria-hidden",w.length===0?"true":"false"),a.tabIndex=w.length===0?-1:0,w.length||(s.classList.remove("active"),s.setAttribute("aria-hidden","true"),a.setAttribute("aria-expanded","false")),s.innerHTML=w.map(Nt).join("")}function tt(i){const a=!!i,s=typeof window.matchMedia=="function"?window.matchMedia("(max-width: 760px)").matches:!1;document.body.classList.toggle("finance-nav-open",a),W.mobileNavToggle&&(W.mobileNavToggle.setAttribute("aria-expanded",a?"true":"false"),W.mobileNavToggle.setAttribute("aria-label",a?"Close navigation":"Open navigation")),W.sidebar&&(s&&!a?(W.sidebar.setAttribute("aria-hidden","true"),W.sidebar.setAttribute("inert","")):(W.sidebar.removeAttribute("aria-hidden"),W.sidebar.removeAttribute("inert")))}function gn(){tt(!document.body.classList.contains("finance-nav-open"))}function He(){tt(!1)}function Gt(i){return le(re(i),!0)}function Kt(i,a){Ne(re(i),!!a)}function G(i){return Array.isArray(i)?i:[]}function Fe(i,a={}){return typeof window.renderSAGIcon=="function"?window.renderSAGIcon(i,a):""}function j(i,a){if(!b&&(i==null||Number(i)===0)||i==null||!Number.isFinite(Number(i)))return"—";const s=window.Store&&typeof window.Store.getFinanceSettings=="function"?window.Store.getFinanceSettings().baseCurrency:"EUR";if(window.FinanceFormatting&&typeof window.FinanceFormatting.formatCurrencyAmount=="function")return window.FinanceFormatting.formatCurrencyAmount(i,{currency:a,baseCurrency:s});const l=a||s||"EUR";return new Intl.NumberFormat(void 0,{style:"currency",currency:l,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(i))}function Dt(i,a,s,l){const g=Gt(i);return`
            <div class="fin-collapsible ${g?"is-collapsed":"is-open"}" data-fin-collapsible="${i}">
                <button class="fin-collapsible-header" type="button" data-fin-action="toggle-collapsible" data-fin-section="${i}" aria-expanded="${g?"false":"true"}">
                    <div class="fin-collapsible-title-wrap">
                        <div class="fin-title">${a}</div>
                        <div class="fin-summary">${s}</div>
                    </div>
                    <span class="fin-collapsible-caret" aria-hidden="true">${g?"▾":"▴"}</span>
                </button>
                <div class="fin-collapsible-body">
                    ${l}
                </div>
            </div>
        `}function yt(){const i=window.FinanceLedger&&typeof window.FinanceLedger.isPipelineActive=="function"?window.FinanceLedger.isPipelineActive:function(a){const s=String(a||"").toLowerCase();return s!=="paid"&&s!=="closed"&&s!=="lost"&&s!=="cancelled"&&s!=="deleted"};return G(e&&e.pipelineDeals).filter(a=>i(a&&a.status))}function jt(){const i=G(e&&e.invoices).filter(S=>String(S&&S.status||"").toLowerCase()==="paid"),a=[];for(let S=5;S>=0;S-=1){const $=new Date;$.setMonth($.getMonth()-S);const w=`${$.getFullYear()}-${String($.getMonth()+1).padStart(2,"0")}`;a.push({key:w,label:$.toLocaleDateString(void 0,{month:"short"}),income:0,expense:0})}const s=new Map(a.map(S=>[S.key,S]));i.forEach(S=>{const $=Date.parse(S&&S.paidAt||S&&S.sentAt||"");if(!Number.isFinite($))return;const w=new Date($),D=`${w.getFullYear()}-${String(w.getMonth()+1).padStart(2,"0")}`,z=s.get(D);if(!z)return;const k=Math.abs(Number(S&&S.amount)||0);z.income+=k});const l=a.some(S=>S.income>0||S.expense>0),g=Math.max(1,...a.map(S=>Math.max(S.income,S.expense)));return{buckets:a,hasData:l,maxValue:g}}function nt(i){const a=i||jt();if(!a.hasData)return Me("No cashflow history. Record your first operating month to unlock rhythms.");const s=100/Math.max(1,a.buckets.length);return`
            <div class="fin-rhythm">
                <div class="fin-muted fin-rhythm-label">Cashflow Rhythm (6 months)</div>
                <div class="fin-rhythm-bars">
                    ${a.buckets.map(l=>{const g=l.income>0?Math.max(2,l.income/a.maxValue*100):0,S=l.expense>0?Math.max(2,l.expense/a.maxValue*100):0;return`
                            <div class="fin-rhythm-month">
                                <div class="fin-rhythm-columns" style="--rhythm-width:${s}%">
                                    <span class="fin-rhythm-bar fin-rhythm-income" style="height:${g}%"></span>
                                    <span class="fin-rhythm-bar fin-rhythm-expense" style="height:${S}%"></span>
                                </div>
                                <span class="fin-rhythm-month-label">${l.label}</span>
                            </div>
                        `}).join("")}
                </div>
            </div>
        `}function Bt(){console.log("[FinancialMode] Initializing..."),Ze(),window.addEventListener("mode-changed",i=>{i.detail.mode==="financial"&&ve()}),window.addEventListener("finance:updated",ve),window.addEventListener("resize",()=>{tt(document.body.classList.contains("finance-nav-open"))}),document.addEventListener("keydown",i=>{i.key==="Escape"&&He(),i.key==="Escape"&&q&&(q="",ve())}),He(),ve()}function Ze(){!W.content||W.content.dataset.finUiBound==="1"||(W.content.dataset.finUiBound="1",W.content.addEventListener("click",i=>{const a=i.target.closest("[data-fin-action]");if(!a||!W.content.contains(a))return;const s=String(a.getAttribute("data-fin-action")||"");if(s==="open-widget-info"){q=String(a.getAttribute("data-widget-info-key")||"").trim(),ve();return}if(s==="close-widget-info"){if(a.classList.contains("fin-info-popover-backdrop")&&i.target!==a)return;q="",ve();return}if(s==="toggle-focus-mode"){const l=!C();l&&window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.saveCurrent=="function"&&window.CoreDashboardLayout.saveCurrent(),F(l),ve();return}if(s==="toggle-collapsible"){const l=String(a.getAttribute("data-fin-section")||"").trim();if(!l)return;Kt(l,!Gt(l)),ve();return}if(s==="set-tab"){const l=String(a.getAttribute("data-fin-tab")||"").trim();X(l),ve();return}if(s==="set-ledger-view"){const l=String(a.getAttribute("data-fin-ledger-view")||"clean").trim();R(l),ve();return}if(s==="set-ledger-filter-preset"){const l=String(a.getAttribute("data-fin-ledger-preset")||"all").trim(),g=String(document.getElementById("fin-ledger-search")?.value||Rt().search||""),S=Object.assign(Z(),{search:g});l==="review"&&(S.reviewStatus="needs_review"),l==="linked"&&(S.linkState="linked"),l==="unlinked"&&(S.linkState="unlinked"),l==="expenses"&&(S.type="expense"),Wt(S),_=!1,ve();return}if(s==="select-ledger-transaction"){if(a.classList.contains("fin-transaction-row")&&i.target.closest("button, a, input, select, textarea"))return;const l=String(a.getAttribute("data-fin-transaction-id")||"").trim();if(!l)return;st(l),ve();return}if(s==="clear-selected-ledger-transaction"){st(""),ve();return}if(s==="toggle-ledger-more-filters"){_=!_,ve();return}if(s==="apply-ledger-filters"){Wt({search:String(document.getElementById("fin-ledger-search")?.value||""),accountId:String(document.getElementById("fin-ledger-account")?.value||"all"),scope:String(document.getElementById("fin-ledger-scope")?.value||"all"),categoryId:String(document.getElementById("fin-ledger-category")?.value||""),type:String(document.getElementById("fin-ledger-type")?.value||"all"),reviewStatus:String(document.getElementById("fin-ledger-review")?.value||"all"),source:String(document.getElementById("fin-ledger-source")?.value||"all"),importBatchId:String(document.getElementById("fin-ledger-import-batch")?.value||"all"),linkState:String(document.getElementById("fin-ledger-link-state")?.value||"all"),amountMin:String(document.getElementById("fin-ledger-amount-min")?.value||""),amountMax:String(document.getElementById("fin-ledger-amount-max")?.value||""),dateFrom:String(document.getElementById("fin-ledger-date-from")?.value||""),dateTo:String(document.getElementById("fin-ledger-date-to")?.value||"")}),ve();return}if(s==="clear-ledger-filters"){_e(),_=!1,ve();return}if(s==="set-treasury-project"){xe(a.getAttribute("data-fin-project")||"all"),ve();return}if(s==="set-scenario-preview"){N=String(a.getAttribute("data-fin-scenario-id")||"").trim(),ve();return}if(s==="save-scenario-preview"){const l=G(y&&y.comparable).find(g=>String(g.id)===String(N));l&&window.Store&&typeof window.Store.saveScenario=="function"&&window.Store.saveScenario({name:l.name,type:l.type,amount:l.amount,protectPercent:l.protectPercent}),ve();return}if(s==="save-decision-scenario-draft"){const l=String(document.getElementById("decision-scenario-type")?.value||"").trim(),g=J.some(([k])=>k===l)?l:"reduce_flexible_costs",S=(J.find(([k])=>k===g)||[g,Xi(g)])[1],$=Math.max(0,Number(document.getElementById("decision-scenario-amount")?.value)||0),w=String(document.getElementById("decision-scenario-protect")?.value||"").trim(),D=w?Math.max(0,Math.min(100,Number(w)||0)):void 0,z=String(document.getElementById("decision-scenario-name")?.value||"").trim();if(window.Store&&typeof window.Store.saveScenario=="function"){const k=window.Store.saveScenario({name:z||`${S} draft`,type:g,amount:$,protectPercent:D});N=String(k&&k.id||"")}ve();return}if(s==="delete-saved-scenario"){const l=String(a.getAttribute("data-fin-scenario-id")||"").trim();l&&window.Store&&typeof window.Store.deleteScenario=="function"&&window.Store.deleteScenario(l),N===l&&(N=""),ve();return}if(s==="select-weekly-focus"){x=String(a.getAttribute("data-fin-focus-id")||"").trim(),ve();return}if(s==="open-treasury-panel"){const l=String(a.getAttribute("data-fin-section")||"").trim();l&&Kt(l,!1),ve();return}if(s==="rename-import-profile"){const l=String(a.getAttribute("data-fin-profile-id")||"").trim(),g=Array.from(W.content.querySelectorAll("[data-fin-profile-name]")).find($=>String($.getAttribute("data-fin-profile-name")||"")===l),S=String(g&&g.value||"").trim();l&&S&&window.Store&&typeof window.Store.renameCsvImportProfile=="function"&&(window.Store.renameCsvImportProfile(l,S),ve());return}if(s==="delete-import-profile"){const l=String(a.getAttribute("data-fin-profile-id")||"").trim();l&&window.Store&&typeof window.Store.deleteCsvImportProfile=="function"&&(window.Store.deleteCsvImportProfile(l),ve());return}if(s==="complete-monthly-review-inline"){wt();return}if(s==="set-invoices-view"){const l=String(a.getAttribute("data-fin-invoices-view")||"open").trim();oe(l),ve();return}s==="toggle-advice"&&ve()}),W.content.addEventListener("change",i=>{const a=i.target;!a||a.id!=="fin-scope-filter"||(window.Store&&typeof window.Store.saveUiSettings=="function"&&window.Store.saveUiSettings({scopeFilter:String(a.value||"all")}),ve())}))}function ve(){const i=window.Store.getUiSettings().scopeFilter||"all",a=window.Store.computeFinanceContext(!0,i);if(t=a.snapshot,e=a.readModel,o=a.treasury||{},c=a.explanations||{},n=a.diagnostics||{},r=window.Store.getReviewState(),u=Hi({readModel:e||{},snapshot:t||{},treasury:o||{},nowIso:new Date().toISOString()}),m=gc({readModel:e||{},snapshot:t||{},treasury:o||{},nowIso:new Date().toISOString()}),f=pr({readModel:e||{},snapshot:t||{},treasury:o||{},forecast:u||{},roadmapMetrics:m||{},reviewState:r||{},settings:window.Store.getUiSettings()||{},nowIso:new Date().toISOString()}),h=Ur({readModel:e||{},treasury:o||{},decisionEngine:f||{},nowIso:new Date().toISOString()}),f&&(f.pressureTimeline=h),y=fr({readModel:e||{},snapshot:t||{},treasury:o||{},forecast:u||{},decisionEngine:f||{},savedScenarios:window.Store.getSavedScenarios().scenarios||[],nowIso:new Date().toISOString()}),(!N||!G(y&&y.comparable).some($=>$.id===N))&&(N=String(y&&y.topScenario&&y.topScenario.id||"")),(!x||!G(f&&f.weeklyFocus).some($=>$.id===x))&&(x=String(f&&f.weeklyFocus&&f.weeklyFocus[0]&&f.weeklyFocus[0].id||"")),b=Number(e&&e.eventsCount)>0,window.FinancialEngine.compute({financeSnapshot:t,financeReadModel:e}),!W.content)return;const s=O(),l=C();on(s),_t(s);const g=ct(s),S=no();W.content.classList.toggle("fin-focus-mode",s==="dashboard"&&l),W.content.innerHTML=g.join("")+S,us(),window.CoreDashboardLayout&&typeof window.CoreDashboardLayout.refresh=="function"&&window.CoreDashboardLayout.refresh()}function ct(i){return Al({ledger:I,invoices:io,goals:os,reviewQueue:Qo,obligationReview:Jo,paymentReview:Xo,tensionSignals:ds,weeklyReview:mt,reports:Do,data:Di,settings:Qr,reserves:Kr,fixedCosts:Yr,decisionBoard:Mo,cashCalendar:rs,scenarioOutcomes:es,pipelineTabs:ss,projection:cs,observatoryHeader:Co,dashboardCockpit:qo,todaysDecision:Vo,next30Days:Ko,nextActions:Go,strategicPicture:Yo},Nl)(i)}function I(){const i=G(e&&e.transactions).slice().sort((P,ze)=>Date.parse(String(ze&&ze.timestamp||""))-Date.parse(String(P&&P.timestamp||""))),a=Rt(),s=String(a.search||"").trim().toLowerCase(),l=Number(a.amountMin),g=Number(a.amountMax),S=Array.from(new Set(i.map(P=>String(P&&P.source||"").trim()).filter(Boolean))).sort(),$=Array.from(new Set(i.map(P=>String(P&&P.importBatchId||"").trim()).filter(Boolean))).sort(),w=i.filter(P=>{const ze=window.FinanceDates?.toDateOnly?.(P&&P.timestamp)||String(P&&P.timestamp||"").slice(0,10),ft=lt(P),In=Math.abs(ft),On=ut(P),ei=a.accountId==="all"||String(P&&P.accountId||"")===String(a.accountId)||String(P&&P.fromAccountId||"")===String(a.accountId)||String(P&&P.toAccountId||"")===String(a.accountId),ti=a.scope==="all"||String(P&&P.scope||"shared")===String(a.scope),Ri=a.type==="all"||String(P&&P.ledgerType||"").toLowerCase()===String(a.type).toLowerCase(),ra=a.reviewStatus==="all"||String(P&&P.reviewStatus||"clear")===String(a.reviewStatus),gt=!a.source||a.source==="all"||String(P&&P.source||"")===String(a.source),oa=!a.importBatchId||a.importBatchId==="all"||String(P&&P.importBatchId||"")===String(a.importBatchId),sa=!a.linkState||a.linkState==="all"||(a.linkState==="linked"?On:!On),ca=!String(a.categoryId||"").trim()||String(P&&P.categoryId||"").toLowerCase().includes(String(a.categoryId).trim().toLowerCase()),la=!String(a.amountMin||"").trim()||!Number.isFinite(l)||In>=l,Ha=!String(a.amountMax||"").trim()||!Number.isFinite(g)||In<=g,zt=(!a.dateFrom||ze>=a.dateFrom)&&(!a.dateTo||ze<=a.dateTo),gs=!s||[P&&P.description,P&&P.accountName,P&&P.fromAccountName,P&&P.toAccountName,P&&P.categoryId,P&&P.source,P&&P.id,P&&P.transactionEntityId].some(vs=>String(vs||"").toLowerCase().includes(s));return ei&&ti&&Ri&&ra&&gt&&oa&&sa&&ca&&la&&Ha&&zt&&gs}),D=V(),z=w.filter(sn),k=w.filter(P=>ut(P)),M=w.filter(P=>dt(P)),E=w.filter(P=>Re(P)),ce=w.filter(P=>Ct(P)),se=k.length,we=w.reduce((P,ze)=>P+lt(ze),0),Ut=et(),Je=i.find(P=>ue(P)===Ut)||null,pt=d(i),un=window.Store&&typeof window.Store.getImportState=="function"?window.Store.getImportState():{batches:[],profiles:[]},Ti=G(un.batches),kt=G(un.profiles),ta=`
            <div class="fin-ledger-status-strip" aria-label="Record status">
                <div><span>Records</span><strong>${w.length}</strong><small>${i.length} total</small></div>
                <div><span>Net movement</span><strong class="${we>=0?"fin-val-pos":"fin-val-neg"}">${we>=0?"+":"-"}${j(Math.abs(we))}</strong><small>Current filters</small></div>
                <div><span>Open items</span><strong>${z.length}</strong><small>Classification or evidence</small></div>
                <div><span>Matched payments</span><strong>${se}</strong><small>Linked obligations</small></div>
            </div>
        `,Ei=(P,ze="ledger")=>{const ft=ue(P),In=lt(P),On=String(P&&P.reviewStatus||"clear").toLowerCase(),ei=P.accountName||P.fromAccountName||P.toAccountName||"Account",ti=je(P),Ri=Be(P),ra=String(P&&(P.ledgerType||P.type)||"record").replace(/[._-]/g," "),gt=(()=>{if(P.obligationId||P.linkedObligationTitle||P.obligationTitle)return{label:"Linked to",title:P.linkedObligationTitle||P.obligationTitle||P.obligationId,copy:"Payment matched to monthly obligation.",actionLabel:"Open obligation",action:"openEditModal",args:`'obligationPayment', '${$e(P.obligationId||ft)}'`};if(P.linkedIncomeTitle||P.linkedIncomeId)return{label:"Linked to",title:P.linkedIncomeTitle||P.linkedIncomeId,copy:"Payment matched to expected income.",actionLabel:"Open income",action:"openEditModal",args:`'income', '${$e(P.linkedIncomeId||ft)}'`};if(P.linkedDebtTitle||P.linkedDebtId)return{label:"Linked to",title:P.linkedDebtTitle||P.linkedDebtId,copy:"Payment connected to debt pressure.",actionLabel:"Open debt",action:"openEditModal",args:`'debt', '${$e(P.linkedDebtId)}'`};const zt=Yt(P);return zt?{label:"Reserve movement",title:zt,copy:"This movement affects protected cash.",actionLabel:"Open Money Plan",action:"FinancialMode.setSection",args:"'plan'"}:P.reversalOf||P.reversedBy?{label:"Reversal",title:P.reversalOf?"This reverses another record":"This record was reversed",copy:P.reversalOf?"A correction was recorded for an earlier transaction.":"A later correction reversed this transaction."}:null})(),oa=gt?`${P.description||"This record"} ${gt.copy.charAt(0).toLowerCase()}${gt.copy.slice(1)}`:On==="needs_review"?"This record needs your eyes before it can support the forecast.":"This record is part of your local cash movement history.",sa=[On==="needs_review"?"Needs review":"Reviewed",gt?"Matched":"",ra,P.scope||"shared"].filter(Boolean),ca=Re(P)?me({action:"openEditModal",args:`'paymentMatch', '${$e(ft)}'`,label:"Edit payment match",icon:"link",tone:"success"}):me({action:"openEditModal",args:`'transactionReview', '${$e(ft)}'`,label:"Edit transaction review"}),la=Re(P)||gt?"":me({action:"openEditModal",args:`'paymentMatch', '${$e(ft)}'`,label:"Match / link",icon:"link",tone:"muted"});return`
                <div class="${["fin-transaction-row",ze==="review"?"fin-transaction-row--review":"",gt?"fin-transaction-row--linked":"",ft===Ut?"active":""].filter(Boolean).join(" ")}" data-fin-action="select-ledger-transaction" data-fin-transaction-id="${v(ft)}" role="button" tabindex="0" aria-label="Open record detail">
                    <div class="fin-transaction-row-main">
                        <div class="fin-transaction-row-frame">
                            <span>
                                <strong>${v(P.description||"Transaction")}</strong>
                                <small>${v([ke(P.timestamp),ei].filter(Boolean).join(" · "))}</small>
                            </span>
                            <span class="fin-transaction-row-primary">
                                <strong class="${In>=0?"fin-val-pos":"fin-val-neg"}">${In>=0?"+":"-"}${j(Math.abs(In),P.currency)}</strong>
                                ${la}
                                ${ca}
                            </span>
                        </div>
                        <div class="fin-chip-row">${sa.map(zt=>`<span class="fin-status-pill">${v(zt)}</span>`).join("")}</div>
                        <p class="fin-transaction-human-copy">${v(oa)}</p>
                        ${gt?`
                            <button class="fin-transaction-link-line" type="button" data-action="${v(gt.action||"openEditModal")}" data-action-args="${v(gt.args||`'paymentMatch', '${$e(ft)}'`)}" aria-label="${v(gt.actionLabel||`Open ${gt.title}`)}">
                                ${Fe("link",{size:"xs",tone:"success"})}
                                <span>
                                    <span>${v(gt.label)}</span>
                                    <strong>${v(gt.title)}</strong>
                                </span>
                            </button>
                        `:""}
                        ${ti.length?`
                            <div class="fin-transaction-suggestion">
                                <span class="fin-eyebrow">Suggested match</span>
                                ${ti.map(zt=>`<strong>${v(zt.title)}</strong><small>${v(zt.reason)}</small>`).join("")}
                            </div>
                        `:""}
                        ${Ri.length?`
                            <div class="fin-transaction-suggestion">
                                <span class="fin-eyebrow">Suggested income match</span>
                                ${Ri.map(zt=>`<strong>${v(zt.title)}</strong><small>${v(zt.reason)}</small>`).join("")}
                            </div>
                        `:""}
                    </div>
                </div>
            `},vi=P=>Ei(P,"ledger"),Sn=P=>Ei(P,"review"),Pi=yt().slice().sort((P,ze)=>(Date.parse(String(P&&P.expectedDateISO||""))||Number.MAX_SAFE_INTEGER)-(Date.parse(String(ze&&ze.expectedDateISO||""))||Number.MAX_SAFE_INTEGER)),na=P=>{const ze=fi(P),ft=Number(P&&P.probability),In=Number.isFinite(ft)?Math.max(0,Math.min(1,ft)):0,On=Number(P&&P.value)||0,ei=Number(P&&P.vatAmount)||0,ti=Number(P&&P.vatRate)||0;return`
                <div class="fin-transaction-row">
                    <div class="fin-transaction-row-main">
                        <div class="fin-transaction-row-frame">
                            <span>
                                <strong>${v(P&&P.title||"Expected income")}</strong>
                                <small>${v([ke(P&&P.expectedDateISO),Fi(P),Ua({status:ze,dueState:ki(P,ze),incomeType:P&&P.incomeType})].filter(Boolean).join(" · "))}</small>
                                ${ei>0?`<small>VAT ${j(ei)} (${v(String(ti||0))}%) on top</small>`:""}
                            </span>
                            <span class="fin-transaction-row-primary">
                                <strong class="fin-val-pos">${j(On)}</strong>
                                ${me({action:"FinancialMode.openAddModal",args:`'income', '${$e(P&&P.id||"")}'`,label:`Edit ${P&&P.title||"expected income"}`})}
                            </span>
                        </div>
                        <div class="fin-chip-row">
                            ${Ft(ze)}
                            ${Ft(ki(P,ze))}
                            <span class="fin-status-pill">${Math.round(In*100)}% reliable</span>
                        </div>
                        <p class="fin-transaction-human-copy">Expected income supports the forecast, but does not count as actual cash until it is received.</p>
                    </div>
                </div>
            `},hi=S.length?`
            <select id="fin-ledger-source" aria-label="Filter records by source">
                <option value="all"${a.source==="all"||!a.source?" selected":""}>All sources</option>
                ${S.map(P=>`<option value="${v(P)}"${String(a.source)===P?" selected":""}>${v(P)}</option>`).join("")}
            </select>
        `:'<input id="fin-ledger-source" aria-label="Filter records by source" value="all" type="hidden" />',$n=$.length?`
            <select id="fin-ledger-import-batch" aria-label="Filter records by import batch">
                <option value="all"${a.importBatchId==="all"||!a.importBatchId?" selected":""}>All import batches</option>
                ${$.map(P=>{const ze=Lt({importBatchId:P}),ft=ze&&ze.sourceFile?`${ze.sourceFile} · ${P}`:P;return`<option value="${v(P)}"${String(a.importBatchId)===P?" selected":""}>${v(ft)}</option>`}).join("")}
            </select>
        `:'<input id="fin-ledger-import-batch" aria-label="Filter records by import batch" value="all" type="hidden" />',ia=cn(a),Rn=[{id:"all",label:"All records",active:![a.accountId&&a.accountId!=="all",a.scope&&a.scope!=="all",String(a.categoryId||"").trim(),a.type&&a.type!=="all",a.reviewStatus&&a.reviewStatus!=="all",a.source&&a.source!=="all",a.importBatchId&&a.importBatchId!=="all",a.linkState&&a.linkState!=="all",String(a.amountMin||"").trim(),String(a.amountMax||"").trim(),a.dateFrom,a.dateTo].some(Boolean)},{id:"review",label:"Needs review",active:a.reviewStatus==="needs_review"},{id:"linked",label:"Linked",active:a.linkState==="linked"},{id:"unlinked",label:"Unlinked",active:a.linkState==="unlinked"},{id:"expenses",label:"Expenses",active:a.type==="expense"}],$t=`
            <div class="fin-ledger-toolbar" aria-label="Record filters">
                <div class="fin-ledger-filter-bar">
                    <input id="fin-ledger-search" aria-label="Search records" value="${v(a.search)}" placeholder="Search note, account, category, source" />
                    <div class="fin-ledger-filter-presets" aria-label="Common record filters">
                        ${Rn.map(P=>`<button class="fin-ledger-preset-chip ${P.active?"active":""}" type="button" data-fin-action="set-ledger-filter-preset" data-fin-ledger-preset="${v(P.id)}">${v(P.label)}</button>`).join("")}
                    </div>
                    <button class="fin-mini-btn" type="button" data-fin-action="toggle-ledger-more-filters" aria-expanded="${_?"true":"false"}">More filters</button>
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="apply-ledger-filters">Apply filters</button>
                </div>
                ${_?`
                <div class="fin-ledger-filter-advanced" aria-label="Advanced record filters">
                    <select id="fin-ledger-account" aria-label="Filter records by account">${Ot(a.accountId)}</select>
                    <input id="fin-ledger-category" aria-label="Filter records by category" value="${v(a.categoryId)}" placeholder="Category" />
                    <input id="fin-ledger-date-from" aria-label="Record date from" type="date" value="${v(a.dateFrom)}" />
                    <input id="fin-ledger-date-to" aria-label="Record date to" type="date" value="${v(a.dateTo)}" />
                    <select id="fin-ledger-scope" aria-label="Filter records by scope">${mr(a.scope)}</select>
                    <select id="fin-ledger-type" aria-label="Filter records by type">
                        <option value="all"${a.type==="all"?" selected":""}>All types</option>
                        <option value="income"${a.type==="income"?" selected":""}>Income</option>
                        <option value="expense"${a.type==="expense"?" selected":""}>Expense</option>
                        <option value="transfer"${a.type==="transfer"?" selected":""}>Transfer</option>
                        <option value="adjustment"${a.type==="adjustment"?" selected":""}>Adjustment</option>
                    </select>
                    <select id="fin-ledger-review" aria-label="Filter records by review status">
                        <option value="all"${a.reviewStatus==="all"?" selected":""}>All review states</option>
                        <option value="clear"${a.reviewStatus==="clear"?" selected":""}>Clear</option>
                        <option value="needs_review"${a.reviewStatus==="needs_review"?" selected":""}>Needs review</option>
                        <option value="reviewed"${a.reviewStatus==="reviewed"?" selected":""}>Reviewed</option>
                    </select>
                    ${hi}
                    ${$n}
                    <select id="fin-ledger-link-state" aria-label="Filter records by link state">
                        <option value="all"${a.linkState==="all"?" selected":""}>All link states</option>
                        <option value="linked"${a.linkState==="linked"?" selected":""}>Linked records</option>
                        <option value="unlinked"${a.linkState==="unlinked"?" selected":""}>Unlinked records</option>
                    </select>
                    <input id="fin-ledger-amount-min" aria-label="Record amount minimum" type="number" min="0" step="0.01" value="${v(a.amountMin)}" placeholder="Minimum amount" />
                    <input id="fin-ledger-amount-max" aria-label="Record amount maximum" type="number" min="0" step="0.01" value="${v(a.amountMax)}" placeholder="Maximum amount" />
                    <button class="fin-mini-btn" type="button" data-fin-action="clear-ledger-filters">Reset filters</button>
                </div>
                `:`
                    <input id="fin-ledger-account" value="${v(a.accountId)}" type="hidden" />
                    <input id="fin-ledger-category" value="${v(a.categoryId)}" type="hidden" />
                    <input id="fin-ledger-date-from" value="${v(a.dateFrom)}" type="hidden" />
                    <input id="fin-ledger-date-to" value="${v(a.dateTo)}" type="hidden" />
                    <input id="fin-ledger-scope" value="${v(a.scope)}" type="hidden" />
                    <input id="fin-ledger-type" value="${v(a.type)}" type="hidden" />
                    <input id="fin-ledger-review" value="${v(a.reviewStatus)}" type="hidden" />
                    <input id="fin-ledger-source" value="${v(a.source)}" type="hidden" />
                    <input id="fin-ledger-import-batch" value="${v(a.importBatchId)}" type="hidden" />
                    <input id="fin-ledger-link-state" value="${v(a.linkState)}" type="hidden" />
                    <input id="fin-ledger-amount-min" value="${v(a.amountMin)}" type="hidden" />
                    <input id="fin-ledger-amount-max" value="${v(a.amountMax)}" type="hidden" />
                `}
                ${ia}
            </div>
        `,aa=`
            <div class="fin-logbook-utility-grid" aria-label="Records utilities">
                <div class="fin-logbook-utility-card fin-board-panel">
                    <span class="fin-eyebrow">Import / Add Entry</span>
                    <strong>${i.length} records</strong>
                    <p>CSV evidence and manual records stay in this workspace.</p>
                </div>
                <div class="fin-logbook-utility-card fin-board-panel">
                    <span class="fin-eyebrow">Category Cleanup</span>
                    <strong>${M.length} need category</strong>
                    <p>${E.length} unmatched payments · ${ce.length} receipt checks.</p>
                    ${pe({label:"Review records",action:"set-ledger-view",local:!0,attrs:'data-fin-ledger-view="work"',size:"sm",fullWidth:!0})}
                </div>
                <div class="fin-logbook-utility-card fin-board-panel">
                    <span class="fin-eyebrow">Recurring Detection</span>
                    <strong>${pt.length} candidates</strong>
                    <p>${pt[0]?`${v(pt[0].label)} appears ${pt[0].count} times.`:"Repeated expenses will appear here once enough records exist."}</p>
                    ${pe({label:"Add recurring cost",action:"FinancialMode.openAddModal",args:"'expense'",size:"sm",fullWidth:!0})}
                </div>
            </div>
        `,ne=Ti.length||kt.length?`
            <div class="fin-logbook-import-panel fin-board-panel" aria-label="Records import history">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="fin-eyebrow">Import history</div>
                        <div class="fin-helper-text">CSV batches and saved mappings live with Records, not app preferences.</div>
                    </div>
                </div>
                ${ln(Ti)}
                <div class="fin-subsection-block">
                    <div class="fin-eyebrow">Saved CSV profiles</div>
                    ${mi(kt)}
                </div>
            </div>
        `:"";let Ue="";return D==="work"?Ue=`
                <div class="fin-review-summary-line">
                    <strong>${M.length}</strong> need category
                    <span>${E.length} unmatched payments</span>
                    <span>${ce.length} receipt checks</span>
                    <span>${w.length} filtered records</span>
                </div>
                ${z.length?z.map(Sn).join(""):Me("No transactions need review for the current filters.")}
            `:D==="matched"?Ue=k.length?k.map(vi).join(""):Me("Matched payments will appear here after records are linked to obligations, income, debt, or reserves."):D==="expected"?Ue=Pi.length?Pi.map(na).join(""):Me("Expected income will appear here. Add upcoming invoices, retainers, confirmed income, proposals, or overdue payments."):Ue=w.length?w.map(vi).join(""):Me("Begin tracking. Add your first payment or sync a CSV."),`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-ledger-workspace-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Transaction Log</div>
                            <div class="fin-helper-text">Raw records live here for review, matching, categorization, import inspection, and detail checks.</div>
                        </div>
                        <div class="fin-action-row">
                            ${pe({label:"Import CSV",action:"openEditModal",args:"'csvImport'"})}
                            ${pe({label:"Export",action:"exportTransactionsCsv"})}
                            ${pe({label:"Add transaction",action:"openEditModal",args:"'transaction', 'expense'",variant:"primary"})}
                        </div>
                    </div>
                    ${aa}
                    ${ne}
                    ${ta}
                    ${$t}
                    <div class="fin-tabs" role="tablist" aria-label="Records zones">
                        <button class="fin-tab-btn ${D==="clean"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="clean">Inbox</button>
                        <button class="fin-tab-btn ${D==="expected"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="expected">Expected</button>
                        <button class="fin-tab-btn ${D==="matched"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="matched">Matched</button>
                        <button class="fin-tab-btn ${D==="work"?"active":""}" type="button" data-fin-action="set-ledger-view" data-fin-ledger-view="work">Review Needed</button>
                    </div>
                    <div class="fin-ledger-workspace-grid">
                        <div class="fin-tab-panel fin-tab-panel--flush">
                            ${Ue}
                        </div>
                        ${A(Je)}
                    </div>
                </div>
            </section>
        `}function d(i){const a=new Map;return G(i).forEach(s=>{const l=lt(s);if(l>=0)return;const g=String(s&&(s.description||s.source||s.categoryId)||"").trim();if(!g)return;const S=g.toLowerCase().replace(/\s+\d{1,2}[./-]\d{1,2}.*/,"").replace(/\s+/g," "),$=a.get(S)||{label:g,count:0,total:0,latest:""};$.count+=1,$.total+=Math.abs(l);const w=window.FinanceDates?.toDateOnly?.(s&&s.timestamp)||String(s&&s.timestamp||"").slice(0,10);w>$.latest&&($.latest=w),a.set(S,$)}),Array.from(a.values()).filter(s=>s.count>=2).sort((s,l)=>l.count-s.count||l.total-s.total).slice(0,4)}function A(i){if(!i)return`
                <aside class="fin-ledger-detail-drawer" aria-label="Record detail drawer">
                    <span class="fin-eyebrow">Record Detail Drawer</span>
                    ${Me("Select a record to inspect evidence, links, import data, and cleanup actions.")}
                </aside>
            `;const a=ue(i),s=lt(i),l=Lt(i),g=[["Date",ke(i.timestamp)],["Amount",`${s>=0?"+":"-"}${j(Math.abs(s),i.currency)}`],["Type",String(i.ledgerType||i.type||"record").replace(/[._-]/g," ")],["Category",i.categoryId||"Uncategorized"],["Account",i.accountName||i.fromAccountName||i.toAccountName||"Account"],["Review state",i.reviewStatus||"clear"],["Source",i.source||"Manual"],["Import batch",l?`${l.sourceFile||"CSV import"} · ${i.importBatchId}`:"None"],["Record ID",a]];return`
            <aside class="fin-ledger-detail-drawer" aria-label="Record detail drawer">
                <div class="fin-section-heading-row">
                    <div>
                        <span class="fin-eyebrow">Record Detail Drawer</span>
                        <strong>${v(i.description||"Transaction")}</strong>
                    </div>
                    <button class="fin-mini-btn" type="button" data-fin-action="clear-selected-ledger-transaction">Close</button>
                </div>
                <div class="fin-ledger-detail-grid">
                    ${g.map(([S,$])=>`
                        <div><span>${v(S)}</span><strong>${v($)}</strong></div>
                    `).join("")}
                </div>
                <div class="fin-action-row fin-action-row--inline">
                    <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${$e(a)}'">Review record</button>
                    <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'paymentMatch', '${$e(a)}'">Match / link</button>
                </div>
            </aside>
        `}function ue(i){return String(i&&(i.id||i.transactionEntityId)||"").trim()}function lt(i){const a=Number(i&&i.signedAmount);if(Number.isFinite(a))return a;const s=Number(i&&i.amount);return Number.isFinite(s)?String(i&&(i.ledgerType||i.type)||"").toLowerCase().indexOf("expense")!==-1?-Math.abs(s):s:0}function dt(i){const a=String(i&&i.categoryId||"").toLowerCase(),s=String(i&&i.reviewStatus||"").toLowerCase();return!a||a==="uncategorized"||s==="needs_review"}function Re(i){return String(i&&i.type)==="expense.recorded"&&!String(i&&i.obligationId||"").trim()&&String(i&&i.categoryId||"").toLowerCase()==="obligation"}function Ct(i){return String(i&&i.type)==="expense.recorded"&&!String(i&&i.receiptUrl||"").trim()&&String(i&&i.categoryId||"").toLowerCase()!=="transfer"}function ut(i){return!!(String(i&&i.obligationId||"").trim()||String(i&&i.linkedIncomeId||"").trim()||String(i&&i.linkedReserveId||"").trim()||String(i&&i.reversalOf||"").trim()||String(i&&i.reversedBy||"").trim())}function sn(i){return dt(i)||Re(i)||Ct(i)}function he(i){return String(i||"").toLowerCase().split(/[^a-z0-9]+/).map(a=>a.trim()).filter(a=>a.length>=4)}function We(i,a){const s=Date.parse(String(i||"")),l=Date.parse(String(a||""));return!Number.isFinite(s)||!Number.isFinite(l)?Number.POSITIVE_INFINITY:Math.abs(s-l)/864e5}function je(i){if(!i||String(i.type)!=="expense.recorded"||String(i.obligationId||"").trim())return[];const a=Math.abs(Number(i.amount)||Number(i.signedAmount)||0),s=new Set(he(i.description));return dn("obligations").filter(l=>String(l&&l.status||"")!=="paid"&&String(l&&l.type||"")!=="debt").map(l=>{const g=Math.abs(Number(l&&l.amount)||0),S=Math.abs(g-a),$=We(i.timestamp,l&&l.dueDate),w=he(l&&l.title).filter(k=>s.has(k)).length;let D=0;const z=[];return S<.01?(D+=6,z.push("same amount")):S<=Math.max(5,a*.05)&&(D+=3,z.push("similar amount")),$<=3?(D+=4,z.push("near due date")):$<=10&&(D+=2,z.push("close date")),w&&(D+=w*2,z.push("matching description")),{id:String(l&&l.id||""),title:String(l&&l.title||"Obligation"),reason:z.join(" + ")||"possible obligation",score:D}}).filter(l=>l.id&&l.score>0).sort((l,g)=>g.score-l.score||l.title.localeCompare(g.title)).slice(0,2)}function Be(i){if(!i||String(i.type)!=="income.received"||String(i.linkedIncomeId||"").trim())return[];const a=Math.abs(Number(i.amount)||Number(i.signedAmount)||0),s=new Set(he(i.description));return G(e&&e.pipelineDeals).filter(l=>{const g=String(l&&l.status||"").toLowerCase();return g!=="paid"&&g!=="closed"&&g!=="lost"&&g!=="cancelled"&&g!=="deleted"}).map(l=>{const g=Math.abs(Number(l&&l.value)||0),S=Math.abs(g-a),$=We(i.timestamp,l&&l.expectedDateISO),w=he(`${l&&l.title||""} ${l&&l.client||""}`).filter(k=>s.has(k)).length;let D=0;const z=[];return S<.01?(D+=6,z.push("same amount")):S<=Math.max(10,a*.05)&&(D+=3,z.push("similar amount")),$<=7?(D+=3,z.push("near expected date")):$<=21&&(D+=1,z.push("close date")),w&&(D+=w*2,z.push("matching description")),{id:String(l&&l.id||""),title:String(l&&l.title||"Expected income"),reason:z.join(" + ")||"possible income match",score:D}}).filter(l=>l.id&&l.score>0).sort((l,g)=>g.score-l.score||l.title.localeCompare(g.title)).slice(0,2)}function Lt(i){const a=String(i&&i.importBatchId||"").trim();if(!a||!window.Store||typeof window.Store.getImportState!="function")return null;const s=window.Store.getImportState();return G(s&&s.batches).find(l=>String(l&&l.id||"")===a)||null}function Yt(i){if(!i)return"";const a=String(i.linkedReserveId||"").trim();if(a)return`Linked reserve ${a}`;if(String(i.ledgerType||i.type||"").toLowerCase()!=="transfer")return"";const l=G(e&&e.fiatAccounts),g=l.find(w=>String(w&&w.id||"")===String(i.fromAccountId||"")),S=l.find(w=>String(w&&w.id||"")===String(i.toAccountId||"")),$=[g,S].filter(w=>w&&(w.reserved||String(w.bucket||"")!=="available"));return $.length?$.map(w=>`${w.name||"Protected account"} (${w.bucket||"reserve"})`).join(" · "):""}function cn(i){const a=[];return String(i.search||"").trim()&&a.push(`Search: ${i.search}`),i.accountId&&i.accountId!=="all"&&a.push("Account filter"),String(i.categoryId||"").trim()&&a.push(`Category: ${i.categoryId}`),i.dateFrom&&a.push(`From ${i.dateFrom}`),i.dateTo&&a.push(`To ${i.dateTo}`),i.scope&&i.scope!=="all"&&a.push(`Scope: ${i.scope}`),i.type&&i.type!=="all"&&a.push(`Type: ${i.type}`),i.reviewStatus&&i.reviewStatus!=="all"&&a.push(`Review: ${String(i.reviewStatus).replace(/_/g," ")}`),i.source&&i.source!=="all"&&a.push(`Source: ${i.source}`),i.importBatchId&&i.importBatchId!=="all"&&a.push(`Import batch: ${i.importBatchId}`),i.linkState&&i.linkState!=="all"&&a.push(i.linkState==="linked"?"Linked records":"Unlinked records"),String(i.amountMin||"").trim()&&a.push(`Min ${i.amountMin}`),String(i.amountMax||"").trim()&&a.push(`Max ${i.amountMax}`),a.length?`
            <div class="fin-ledger-filter-chips" aria-label="Active record filters">
                ${a.map(s=>`<span class="fin-status-pill">${v(s)}</span>`).join("")}
                <button class="fin-mini-btn" type="button" data-fin-action="clear-ledger-filters">Clear all</button>
            </div>
        `:""}function wt(){const i=Array.from(document.querySelectorAll(".monthly-review-account-check")),a=Array.from(document.querySelectorAll(".monthly-review-check"));if(!i.length){B="Add a cash account before saving a checkpoint.",ve();return}if(i.some(l=>!l.checked)||a.some(l=>!l.checked)){B="Confirm each account and each review step before saving a checkpoint.",ve();return}const s=i.map(l=>{const g=String(l.getAttribute("data-review-index")||""),S=document.getElementById(`monthly-review-balance-${g}`);return{accountId:String(l.getAttribute("data-account-id")||""),balance:Number(S&&S.value)}});if(s.some(l=>!l.accountId||!Number.isFinite(l.balance))){B="Enter a valid reconciled balance for every account.",ve();return}try{const l=G(f&&f.weeklyFocus).find(g=>String(g.id)===String(x))||G(f&&f.weeklyFocus)[0]||null;window.Store&&typeof window.Store.completeWeeklyReview=="function"&&window.Store.completeWeeklyReview({accounts:s,unresolvedItems:!0,matchPayments:!0,confirmObligations:!0,reviewSignals:!0,closeMonth:!0,chosenFocus:l?{id:String(l.id),title:String(l.title||"Weekly focus")}:void 0,notes:String(document.getElementById("monthly-review-notes")?.value||"")}),B="",ve()}catch(l){B=l instanceof Error?l.message:"Could not complete this review.",ve()}}function St(){const i=Ar({readModel:e||{},snapshot:t||{},treasury:o||{},reviewQueue:dn("reviewQueue"),forecast:u,nowIso:new Date().toISOString()}),a=Number.isFinite(Number(i.runwayNow))?`${Number(i.runwayNow).toFixed(1)} months`:"Unknown";return`
            <div class="fin-monthly-review-panel fin-monthly-review-summary" aria-label="Checkpoint summary">
                <div class="fin-eyebrow">Checkpoint summary</div>
                <div class="backup-preview-card">
                    <div><span>Net movement</span><strong class="${i.netMovement>=0?"fin-val-pos":"fin-val-neg"}">${i.netMovement>=0?"+":"-"}${j(Math.abs(i.netMovement))}</strong></div>
                    <div><span>Income received</span><strong>${j(i.incomeReceived)}</strong></div>
                    <div><span>Expenses paid</span><strong>${j(i.expensesPaid)}</strong></div>
                    <div><span>Obligations reviewed</span><strong>${i.obligationsReviewed}</strong></div>
                    <div><span>Reserve movements</span><strong>${i.reserveMovements}</strong></div>
                    <div><span>Runway now</span><strong>${v(a)}</strong></div>
                    <div><span>Unresolved items</span><strong>${i.unresolvedItems}</strong></div>
                    <div><span>Reserve / burn check</span><strong>${j(i.protectedCash)} protected · ${j(i.monthlyBurn)}/mo burn</strong></div>
                    <div><span>30-day forecast</span><strong>${i.forecastExpectedCash==null?"Unknown":j(i.forecastExpectedCash)}</strong></div>
                </div>
                <div class="fin-helper-text">${v(i.mainRisk)} ${v(i.mainAction)}</div>
            </div>
        `}function ie(){const i=G(r&&r.history).slice(0,3);return`
            <div class="fin-monthly-review-panel" aria-label="Saved checkpoints">
                <div class="fin-eyebrow">Saved checkpoints</div>
                ${i.length?i.map(a=>{const s=a.summary||{},l=Number(s.runwayNow),g=Number.isFinite(l)?`${l.toFixed(1)} months`:"Unknown",S=s.forecastExpectedCash==null?"":` · 30-day ${j(s.forecastExpectedCash)}`;return`
                        <div class="fin-review-check-row is-ready">
                            <span>
                                <strong>${v(a.monthKey||"Checkpoint")}</strong>
                                <small>Saved ${ke(a.closedAt)}${v(S)} · ${v(s.mainRisk||"No major checkpoint risk detected.")}</small>
                                <small>${v(s.mainAction||"Keep next month reviewed on the same cadence.")}</small>
                                ${a.chosenFocus?`<small>Focus: ${v(a.chosenFocus.title||"Weekly focus")}</small>`:""}
                            </span>
                            <span class="fin-status-pill">${s.unresolvedItems||0} open · ${v(g)}</span>
                            <strong class="${Number(s.netMovement)>=0?"fin-val-pos":"fin-val-neg"}">${Number(s.netMovement)>=0?"+":"-"}${j(Math.abs(Number(s.netMovement)||0))}</strong>
                        </div>
                    `}).join(""):Me("Save a checkpoint to start the local review history.")}
            </div>
        `}function me({action:i,args:a,label:s,icon:l="edit",tone:g="muted",extraClass:S="",attrs:$="",local:w=!1}){const D=w?`data-fin-action="${v(i)}"`:`data-action="${v(i)}"${a?` data-action-args="${v(a)}"`:""}`;return`
            <button class="fin-mini-btn fin-icon-btn ${S}" type="button" ${D} ${$} aria-label="${v(s)}" title="${v(s)}">
                ${Fe(l,{size:"xs",tone:g})}
            </button>
        `}function Ve(i){return me(i)}function mt(){const i=Xn(),a=G(e&&e.fiatAccounts),s=dn("reviewQueue"),l=dn("obligations").filter(k=>["overdue","due_soon","needs_review"].includes(String(k&&k.status||""))),g=G(f&&f.weeklyFocus).slice(0,3),S=G(h&&h["30d"]).filter(k=>k.sourceType==="income").slice(0,4),$=G(h&&h["30d"]).filter(k=>k.kind==="Debt starts"||k.sourceType==="debt_plan").slice(0,4),w=ge("safeToSpend",Number(t&&t.safeToSpend)||0),D=Number(t&&t.runwayMonths)>=3,z=[["unresolvedItems","Resolve unclear items",s.filter(k=>String(k&&k.kind)==="transaction"||String(k&&k.kind)==="payment").length===0,"Classify or match records that affect the ledger."],["matchPayments","Review income",S.length===0,S.length?"Confirm dated income confidence before saving.":"No dated income needs attention in the next 30 days."],["confirmObligations","Review obligations",l.length===0,"Pay, defer, or keep due costs flagged for review."],["reviewSignals","Confirm Safe-to-Spend",D&&w>=0,`${j(w)} currently safe after protected cash and pressure.`],["closeMonth","Choose focus",!!(x||g.length===0),"Pick the focus to carry into the week."]];return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-monthly-review-workspace">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">${i?"Checkpoint recommended":"Checkpoint saved"}</div>
                            <div class="fin-helper-text">Keep Cash Timeline updated weekly. Save checkpoints when you want history, pattern memory, or a review note.</div>
                            <div class="fin-operating-meta">Last reviewed ${ke(r&&r.lastReviewedAt)}</div>
                        </div>
                    </div>
                    <div class="fin-monthly-review-grid">
                        <div class="fin-monthly-review-panel">
                            <div class="fin-eyebrow">Cash accounts</div>
                            ${a.length?a.map((k,M)=>`
                                <label class="fin-review-check-row">
                                    <input class="monthly-review-account-check" type="checkbox" data-account-id="${v(k.id)}" data-review-index="${M}" />
                                    <span><strong>${v(k.name||"Account")}</strong><small>${v(k.scope||"shared")} · Confirm live balance</small></span>
                                    <input id="monthly-review-balance-${M}" aria-label="${v(k.name||"Account")} reconciled balance" type="number" step="0.01" value="${v(k.balance)}" />
                                </label>
                            `).join(""):Me("Add a cash account before completing a review.")}
                        </div>
                        <div class="fin-monthly-review-panel">
                            <div class="fin-eyebrow">Review steps</div>
                            ${z.map(([k,M,E,ce])=>`
                                <label class="fin-review-check-row ${E?"is-ready":""}">
                                    <input id="monthly-review-${k}" class="monthly-review-check" type="checkbox" />
                                    <span><strong>${v(M)}</strong><small>${v(ce)}</small></span>
                                    <span class="fin-status-pill">${E?"Ready":"Check"}</span>
                                </label>
                            `).join("")}
                        </div>
                    </div>
                    <div class="fin-monthly-review-panel fin-weekly-focus-panel" aria-label="Weekly focus choices">
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="fin-eyebrow">This week’s focus</div>
                                <div class="fin-helper-text">Choose one focus from Decision Lab before saving the checkpoint.</div>
                            </div>
                            <span class="fin-status-pill">${g.length}</span>
                        </div>
                        ${g.length?g.map(k=>`
                            <button class="fin-weekly-focus-choice ${String(x)===String(k.id)?"active":""}" type="button" data-fin-action="select-weekly-focus" data-fin-focus-id="${v(k.id)}">
                                <span><strong>${v(k.title||"Weekly focus")}</strong><small>${v(k.reason||"")}</small></span>
                                <span>${v(k.actionLabel||"Review")}</span>
                            </button>
                        `).join(""):Me("No urgent focus from Decision Lab. Save the checkpoint with the operating loop current.")}
                    </div>
                    <div class="fin-monthly-review-grid">
                        <div class="fin-monthly-review-panel fin-review-compact-check" aria-label="Income confidence check">
                            <div class="fin-eyebrow">Income review</div>
                            <strong>${S.length?`${S.length} dated items`:"No dated income to review"}</strong>
                            <span>${S.length?`${v(S[0].label)} · ${ke(S[0].date)}`:"Cash Timeline has no income confidence work in the next 30 days."}</span>
                            ${pe({label:"Open Cash Timeline",action:"FinancialMode.setSection",args:"'flow'",size:"sm"})}
                        </div>
                        <div class="fin-monthly-review-panel fin-review-compact-check" aria-label="Payment plan start check">
                            <div class="fin-eyebrow">Debt starts</div>
                            <strong>${$.length?`${$.length} plan checks`:"No plan starts due"}</strong>
                            <span>${$.length?`${v($[0].label)} · ${ke($[0].date)}`:"No debt starts or payment-plan pressure in the next 30 days."}</span>
                            ${pe({label:"Open Money Plan",action:"FinancialMode.setSection",args:"'plan'",size:"sm"})}
                        </div>
                    </div>
                    ${St()}
                    ${ie()}
                    <label class="fin-review-notes">
                        <span class="fin-eyebrow">Review note</span>
                        <textarea id="monthly-review-notes" rows="3" placeholder="What changed, what needs attention?">${v(r&&r.notes||"")}</textarea>
                    </label>
                    ${B?`<div class="fin-inline-error" role="alert">${v(B)}</div>`:""}
                    <div class="fin-review-final-action">
                        <span>Optional but useful: saving creates checkpoint history and unlocks Pattern Memory over time.</span>
                        <button class="fin-mini-btn fin-mini-btn--primary" type="button" data-fin-action="complete-monthly-review-inline">Save checkpoint</button>
                    </div>
                </div>
            </section>
        `}function Qt(i,a){return`
            ${qt({title:i.title,meta:`${i.reason} · ${i.kind||"review"}`,rightHtml:Ft(i.tone==="urgent"?"overdue":"needs_review"),actionHtml:a,iconHtml:Fe("review",{size:"sm",tone:i.tone==="urgent"?"danger":"muted"}),extraClass:"fin-review-row"})}
        `}function mi(i){return i.length?`
            <div class="fin-import-profile-list" aria-label="Saved CSV profiles">
                ${i.map(a=>{const s=a.mapping||{},l=["date","description","amount","debit","credit","category","scope"].filter(g=>String(s[g]||"").trim()).length;return`
                        <div class="fin-import-profile-row">
                            <div class="fin-import-profile-main">
                                <input data-fin-profile-name="${v(a.id)}" aria-label="CSV profile name" value="${v(a.name||"CSV mapping")}" />
                                <small>${G(a.headers).length} headers · ${l} mapped · ${v(a.defaultCategory||"uncategorized")} · ${v(a.defaultScope||"business")} · updated ${ke(a.updatedAt)}</small>
                            </div>
                            <div class="fin-ledger-actions">
                                ${me({action:"rename-import-profile",label:`Rename ${a.name||"CSV profile"}`,icon:"success",tone:"success",attrs:`data-fin-profile-id="${v(a.id)}"`,local:!0})}
                                ${me({action:"delete-import-profile",label:`Delete ${a.name||"CSV profile"}`,icon:"close",tone:"danger",attrs:`data-fin-profile-id="${v(a.id)}"`,local:!0})}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `:Me("Saved CSV mappings will appear here after a successful import.")}function ln(i){return i.length?`
            <div class="fin-import-profile-list" aria-label="CSV import batches">
                ${i.slice().reverse().slice(0,4).map((a,s)=>{const l=Number(a.importedCount??G(a.fingerprints).length)||0,g=Number(a.duplicateCount||0),S=Number(a.duplicateImportedCount||0),$=Number(a.rejectedCount||0),w=a.duplicatePolicy==="import"?"duplicates imported":"duplicates skipped",D=a.dateFrom&&a.dateTo?a.dateFrom===a.dateTo?a.dateFrom:`${a.dateFrom} to ${a.dateTo}`:"date range unknown",z=`${j(Number(a.incomeTotal||0))} in · ${j(Number(a.expenseTotal||0))} out`,k=G(e&&e.transactions).filter(M=>String(M&&M.importBatchId||"")===String(a.id)).length;return`
                        <div class="fin-import-profile-row">
                            <div class="fin-import-profile-main">
                                <strong>${s===0?"Latest CSV batch":"CSV batch"}</strong>
                                <small>${v(a.sourceFile||"CSV import")} · ${l} imported · ${g} duplicate${g===1?"":"s"} (${w}) · ${$} rejected</small>
                                <small>${v(D)} · ${z}${S?` · ${S} duplicate${S===1?"":"s"} included`:""} · ${k?`${k} active`:"undo applied"}</small>
                                <small>Batch ID ${v(a.id)}</small>
                            </div>
                            <div class="fin-ledger-actions">
                                ${pe({label:"Undo",action:"undoImportBatch",args:`'${$e(a.id)}'`,size:"sm",variant:"ghost"})}
                            </div>
                        </div>
                    `}).join("")}
            </div>
        `:Me("No local imports found. Bring in your bank statements (CSV).")}function Di(){const i=window.Store&&typeof window.Store.getLocalDataHealth=="function"?window.Store.getLocalDataHealth():{ok:!0,issues:[],eventCount:0,latestEventAt:null,storageStatus:"healthy",schemaLabel:"unknown",lastBackupAt:null,privateModeWarning:!1,migrationStatus:"current"},a=String(i.storageStatus||"healthy"),s=a==="unavailable"?"Unavailable":a==="limited"?"Limited":"Healthy",l=i.lastBackupAt?ke(i.lastBackupAt):"Never";return`
            <section class="fin-section">
                <div class="fin-operational-row">
                    <div class="widget ui-card glass fin-card fin-board-frame">
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="widget-title ui-title">Backup & Restore</div>
                                <div class="fin-helper-text">One local backup flow for export and restore. CSV import history lives in Records.</div>
                            </div>
                        </div>
                        <div class="backup-preview-card fin-settings-backup-summary" aria-label="Backup readiness">
                            <div><span>Last backup</span><strong>${l}</strong></div>
                            <div><span>Schema</span><strong>${v(i.schemaLabel||"unknown")}</strong></div>
                            <div><span>Finance events</span><strong>${Number(i.eventCount||0)}</strong></div>
                        </div>
                        <div class="fin-action-row">
                            ${pe({label:"Export backup",action:"exportFinanceBackup"})}
                            ${pe({label:"Restore backup",action:"openEditModal",args:"'backupRestore'"})}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame">
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="widget-title ui-title">Local Data Health</div>
                                <div class="fin-helper-text">${i.ok?"Local finance data is readable and backup-ready.":"Some local Finance Master data needs attention."}</div>
                            </div>
                        </div>
                        ${qt({title:i.ok?"Healthy":"Needs attention",meta:`${Number(i.eventCount||0)} finance events${i.latestEventAt?` · latest ${ke(i.latestEventAt)}`:""}`,amount:`${i.issues.length} issue${i.issues.length===1?"":"s"}`,iconHtml:Fe(i.ok?"success":"warning",{size:"sm",tone:i.ok?"success":"danger"}),extraClass:"fin-board-list-row"})}
                        <div class="backup-preview-card">
                            <div><span>Storage</span><strong>${s}</strong></div>
                            <div><span>Last backup</span><strong>${l}</strong></div>
                            <div><span>Schema</span><strong>${v(i.schemaLabel||"unknown")}</strong></div>
                            <div><span>Migration</span><strong>${v(i.migrationStatus||"current")}</strong></div>
                        </div>
                        ${i.privateModeWarning?`
                            <div class="fin-compact-empty">Your browser may not keep local data permanently in this mode. Export a backup before closing this window.</div>
                        `:""}
                        ${i.issues.length?`
                            <div class="fin-compact-empty">${i.issues.map(g=>`${v(g.label)}: ${v(g.message)}`).join("<br>")}</div>
                        `:""}
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame fin-danger-zone fin-settings-danger-zone">
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="widget-title ui-title">Data safety actions</div>
                                <div class="fin-helper-text">Export a backup first if you may need this data later. Each action opens a typed confirmation.</div>
                            </div>
                        </div>
                        <div class="fin-settings-danger-list" aria-label="Destructive data actions">
                            <div class="fin-settings-danger-row">
                                <div>
                                    <strong>Reset local data</strong>
                                    <span>Clears Finance Master data, settings, review state, import history, goals, and cached local values in this browser.</span>
                                </div>
                                ${pe({label:"Reset local data",action:"resetLocalFinanceData",variant:"danger"})}
                            </div>
                            <div class="fin-settings-danger-row">
                                <div>
                                    <strong>Restore sample data</strong>
                                    <span>Replaces the current local ledger with the fictional sample ledger for exploration.</span>
                                </div>
                                ${pe({label:"Restore sample data",action:"resetDemoData"})}
                            </div>
                            <div class="fin-settings-danger-row">
                                <div>
                                    <strong>Delete sample data</strong>
                                    <span>Clears the fictional sample ledger so the app is ready for your own entries or a backup restore.</span>
                                </div>
                                ${pe({label:"Delete sample data",action:"deleteDemoData",variant:"danger"})}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `}function pi(i,a="monthly"){const s=Math.abs(Number(i)||0),l=String(a||"monthly").toLowerCase().replace(/[\s-]+/g,"_");return l==="weekly"||l==="week"?s*52/12:l==="biweekly"||l==="two_weekly"||l==="every_two_weeks"||l==="fortnightly"?s*26/12:l==="quarterly"||l==="quarter"?s/3:l==="yearly"||l==="annual"||l==="annually"?s/12:s}function it(i){const a=Number(i&&i.monthlyPressure);if(Number.isFinite(a))return Math.max(0,a);const s=Number(i&&i.minimumPaymentMonthly);return Number.isFinite(s)?Math.max(0,s):pi(i&&i.minimumPayment,i&&i.frequency)}function wn(i){const a=String(i&&i.planStatus||"").trim();return a&&a!=="missing"?!0:!!(i&&i.planType==="custom"&&G(i.installments).length>0||it(i)>0||String(i&&i.paymentPlanNote||"").trim())}function Ci(i){const a=String(i&&i.planStatus||(wn(i)?"active":"missing")).replace(/_/g," ");return a.charAt(0).toUpperCase()+a.slice(1)}function Qi(i){return G(i).reduce((a,s)=>{const l=Math.max(0,Number(s&&s.targetAmount)||0),g=Math.max(0,Number(s&&s.currentAmount)||0);return a+Math.max(0,l-g)},0)}function p(i){const a={};try{const s=localStorage.getItem("finance-master.ui.expenseOrder");s&&JSON.parse(s).forEach((l,g)=>{a[l]=g})}catch{}return G(i).slice().sort((s,l)=>{const g=Object.prototype.hasOwnProperty.call(a,s&&s.id)?a[s.id]:99999,S=Object.prototype.hasOwnProperty.call(a,l&&l.id)?a[l.id]:99999;return g-S})}function ee(i,a){const s=Math.max(1,Math.abs(Number(a)||0));return Math.max(6,Math.min(100,Math.abs(Number(i)||0)/s*100))}function be(i,a){return G(i).length?G(i).map(s=>`
            ${qt({title:s.category||"Recurring cost",meta:`Due day ${String(s.dueDay||"not set")} · ${s.scope||"shared"} · ${a}`,amount:`${j(s.monthlyAmount)} / mo`,actionHtml:me({action:"FinancialMode.openAddModal",args:`'expense', '${$e(s.id)}'`,label:`Edit ${s.category||"recurring cost"}`}),iconHtml:Fe("calendar",{size:"sm",tone:"muted"}),extraClass:"fin-treasury-compact-row"})}
        `).join(""):Me(`No ${a.toLowerCase()} costs recorded.`)}function Le(i){return G(i).length?G(i).map(a=>{const s=Math.max(0,Number(a.currentAmount)||0),l=Math.max(0,Number(a.targetAmount)||0),g=l>0?Math.min(100,Math.round(s/l*100)):100,S=g>=100?"Protected":g>=50?"Building":"Below target";return`
                <div class="fin-treasury-reserve-card">
                    <div class="fin-treasury-reserve-head">
                        <span>
                            <strong>${v(a.name||"Reserve bucket")}</strong>
                            <small>${v(String(a.purpose||"reserve").replace(/_/g," "))} · ${v(a.scope||"shared")}</small>
                        </span>
                        ${Ft(S)}
                    </div>
                    <div class="fin-treasury-reserve-value">
                        <strong>${j(s)}</strong>
                        <small>of ${j(l)}</small>
                    </div>
                    <div class="fin-treasury-meter"><span style="width:${g}%"></span></div>
                    <div class="fin-treasury-row-actions">
                        ${me({action:"openEditModal",args:`'reserveBucket', '${$e(a.id)}'`,label:`Adjust target for ${a.name||"reserve bucket"}`})}
                    </div>
                </div>
            `}).join(""):Me("Protect your runway. Create your first reserve bucket, such as taxes or buffer.")}function xt(i){const a=String(i&&i.planStatus||(wn(i)?"active":"missing"));return a==="archived"||a==="completed"?"completed_archived":a==="starts_later"?"starts_later":a==="on_hold"?"on_hold":a==="irregular"?"irregular":a==="missing"?"no_plan":it(i)>0?"active_pressure":"no_plan"}function Kn(i){const a=$e(i&&i.id||""),s=String(i&&i.planStatus||""),l=pe(s==="on_hold"||s==="archived"||s==="completed"?{label:"Reactivate",action:"reactivateDebtPlan",args:`'${a}'`,size:"sm",variant:"ghost"}:{label:"Pause",action:"pauseDebtPlan",args:`'${a}'`,size:"sm",variant:"ghost"});return`
            ${me({action:"FinancialMode.openAddModal",args:`'debtPlan', '${a}'`,label:`Edit payment plan for ${i.name||"debt item"}`})}
            ${pe({label:"Record payment",action:"FinancialMode.openAddModal",args:"'debtPayment'",size:"sm"})}
            ${l}
            ${pe({label:"Complete",action:"completeDebtPlan",args:`'${a}'`,size:"sm",variant:"ghost"})}
            ${pe({label:"Archive",action:"archiveDebtPlan",args:`'${a}'`,size:"sm",variant:"ghost"})}
            ${pe({label:"Delete",action:"deleteDebtAccount",args:`'${a}'`,size:"sm",variant:"danger"})}
        `}function Zt(i){const a=Math.max(0,Number(i.outstanding)||0),s=Math.max(0,Number(i.totalAdded)||0),l=Math.max(0,Number(i.totalPaid)||0),g=s>0?Math.min(100,Math.round(l/s*100)):0,S=it(i),$=wn(i);return`
                <div class="fin-treasury-debt-card">
                    <div class="fin-treasury-debt-head">
                        <span>
                            <strong>${v(i.name||"Debt item")}</strong>
                            <small>${i.startDate?`Starts ${ke(i.startDate)} · `:""}${i.dueDate?`Due ${ke(i.dueDate)} · `:""}${v(i.scope||"shared")}</small>
                        </span>
                        ${Ft($?Ci(i):"Needs review")}
                    </div>
                    <div class="fin-treasury-debt-main">
                        <strong>${j(a)}</strong>
                        <span>${S>0?`${j(S)} / mo pressure`:"No current monthly pressure"}</span>
                    </div>
                    <div class="fin-treasury-meter fin-treasury-meter--debt"><span style="width:${g}%"></span></div>
                    <div class="fin-treasury-debt-foot">
                        <small>${l>0?`${j(l)} paid`:"Repayment not started"}</small>
                        <small>${i.estimatedPayoffDate?`Projected payoff ${ke(i.estimatedPayoffDate)}`:"Payoff timeline needs plan"}</small>
                    </div>
                    <div class="fin-treasury-row-actions">
                        ${Kn(i)}
                    </div>
                </div>
            `}function Yn(i){const a=G(i).filter(l=>Math.max(0,Number(l&&l.outstanding)||0)>0).sort((l,g)=>it(g)-it(l)||String(l&&l.name||"").localeCompare(String(g&&g.name||"")));return a.length?`
            <div class="fin-debt-control-panel">
                ${[["active_pressure","Active pressure","Counting in current monthly pressure"],["starts_later","Starts later","Visible as future pressure, not current burn"],["on_hold","On hold","Tracked as liability, paused from current pressure"],["irregular","Irregular","Only custom monthly pressure counts"],["no_plan","No plan","Liability exists but pressure needs a decision"],["completed_archived","Completed / archived","Kept out of active calculations"]].map(([l,g,S])=>{const $=a.filter(w=>xt(w)===l);return $.length?`
                        <div class="fin-debt-control-group" data-debt-group="${v(l)}">
                            <div class="fin-debt-control-head">
                                <span><strong>${v(g)}</strong><small>${v(S)}</small></span>
                                <span class="fin-status-pill">${$.length}</span>
                            </div>
                            <div class="fin-treasury-debt-grid">${$.map(Zt).join("")}</div>
                        </div>
                    `:""}).join("")}
            </div>
        `:Me("Debt-free operations.")}function Qn(){return G(e?.projectProfiles).filter(i=>i&&String(i.status||"active")!=="archived").sort((i,a)=>String(i.name||"").localeCompare(String(a.name||"")))}function Vr(i){return String(i&&i.projectId||"").trim()}function Hr(i,a){const s=String(a||"all");if(s==="all")return!0;const l=Vr(i);return s==="unassigned"?!l:l===s}function xi(i,a){return G(i).reduce((s,l)=>s+(Number(a(l))||0),0)}function Wr(){const i=Qn(),a=de(),s=i.find(we=>String(we.id)===a)||null,l=a==="unassigned"||s?a:"all";l!==a&&xe(l);const g=l!=="all",S=l==="all"?"All Money Plan":l==="unassigned"?"Unassigned":String(s?.name||"Project plan"),$=we=>G(we).filter(Ut=>Hr(Ut,l)),w=$(e?.fiatAccounts),D=$(e?.reserveBuckets),z=$(e?.recurringExpenses),k=$(e?.debtAccounts),M=$(e?.pipelineDeals),E=$(e?.invoices),ce=$(e?.transactions),se=new Set(w.map(we=>String(we.id||"")).filter(Boolean));return{selected:l,label:S,project:s,projects:i,isProjectView:g,fiatAccounts:w,reserveBuckets:D,recurringExpenses:z,debtAccounts:k,pipelineDeals:M,invoices:E,transactions:ce,accountIds:se}}function Gr(i){const a=G(i?.projects),s=String(i?.selected||"all"),l=(g,S,$="")=>`
            <button class="fin-treasury-profile-btn ${s===g?"active":""}" type="button" data-fin-action="set-treasury-project" data-fin-project="${v(g)}" aria-pressed="${s===g?"true":"false"}">
                <span>${v(S)}</span>
                ${$?`<small>${v($)}</small>`:""}
            </button>
        `;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-profiles">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Money Plan Profiles</div>
                            <div class="fin-helper-text">Tagged views for projects, clients, and individual wallets. The full Money Plan stays canonical.</div>
                        </div>
                        <div class="fin-treasury-profile-actions">
                            ${i?.project&&s!=="unassigned"?me({action:"openEditModal",args:`'projectProfile', '${$e(i.project.id)}'`,label:`Edit ${i.project.name||"project plan"}`}):""}
                            ${pe({label:"Add project",action:"openEditModal",args:"'projectProfile'",variant:"primary"})}
                        </div>
                    </div>
                    <div class="fin-treasury-profile-strip" role="list" aria-label="Money Plan profile views">
                        ${l("all","All Money Plan","Full system")}
                        ${a.map(g=>l(String(g.id),g.name||"Project plan",g.clientOrPurpose||"Project view")).join("")}
                        ${l("unassigned","Unassigned","No project tag")}
                    </div>
                </div>
            </section>
        `}function Kr(){const i=Wr(),a=G(i.fiatAccounts),s=G(i.reserveBuckets),l=G(i.debtAccounts),g=p(i.recurringExpenses),S=g.filter(ne=>ne&&ne.essential),$=g.filter(ne=>!ne||!ne.essential),w=S.reduce((ne,Ue)=>ne+(Number(Ue.monthlyAmount)||0),0),D=$.reduce((ne,Ue)=>ne+(Number(Ue.monthlyAmount)||0),0),z=l.reduce((ne,Ue)=>ne+it(Ue),0),k=xi(a,ne=>ne.balance),M=xi(s,ne=>ne.currentAmount),E=w+D+z,ce=k-M-E,se=i.isProjectView?k:ge("actualCash",ge("totalCash",Number(t?.realBalance)||0)),we=i.isProjectView?M:ge("protectedCash",ge("reservedCash",Number(t?.reservedCash)||0)),Ut=i.isProjectView?E:ge("committedShortTermObligations",0),Je=i.isProjectView?ce:ge("availableCash",Number.isFinite(Number(t?.availableCash))?Number(t.availableCash):se-we),pt=i.isProjectView?E:ge("totalMonthlyBurn",Number(t?.monthlyBurn)||w+D+z),un=i.isProjectView?pt>0?Je/pt:null:Number(o?.runwayMonths??t?.runwayMonths),Ti=Number.isFinite(un)?`${un.toFixed(1)} months`:"Unknown",kt=l.filter(ne=>Math.max(0,Number(ne&&ne.outstanding)||0)>0),ta=xi(a.filter(ne=>{const Ue=String(ne&&ne.bucket||"available");return!!(ne&&ne.reserved)||Ue!=="available"}),ne=>ne.balance),Ei=xi(s,ne=>ne.currentAmount),vi=i.isProjectView?kt.reduce((ne,Ue)=>ne+(Number(Ue.outstanding)||0),0):ge("debtRemaining",La("debtBurden",kt.reduce((ne,Ue)=>ne+(Number(Ue.outstanding)||0),0))),Sn=kt.filter(ne=>String(ne&&ne.planStatus||"")==="missing"||!wn(ne)),Pi=Math.max(0,kt.length-Sn.length),na=s.reduce((ne,Ue)=>ne+Math.max(0,Number(Ue.targetAmount)||0),0),hi=Qi(s),$n=Je-w-D-z,ia=Math.max(1,Math.abs(Je),w,D,z,we,Math.abs($n));let Pn=typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter||"all"):[];i.isProjectView&&(Pn=G(Pn).filter(ne=>G(ne.linkedAccountIds).some(Ue=>i.accountIds.has(String(Ue)))));let Rn={className:"is-stable"};Je<0||$n<0?Rn={label:"Critical shortfall",className:"is-critical",copy:"Near-term obligations need coverage before future goals."}:Number.isFinite(un)&&un<2?Rn={label:"Tight runway",className:"is-watch",copy:"Cash covers a thin operating window."}:Sn.length?Rn={label:"Needs plan",className:"is-watch",copy:"Debt plans need confirmation for reliable burn."}:hi>0&&(Rn={label:"Needs protection",className:"is-watch",copy:"Reserve targets are not fully protected yet."});let $t={primaryLabel:"Open Reality Check",primaryAction:"FinancialMode.setSection",primaryArgs:"'review'",secondary:[]};Je<0||$n<0?$t={title:"Cover near-term obligations before funding savings goals",body:"Free cash is under pressure. Stabilize the next 30 days before adding to future goals.",primaryLabel:"Allocate available cash",primaryAction:"openEditModal",primaryArgs:"'allocateReserves'",secondary:[{label:"Review flexible costs",localAction:"open-treasury-panel",section:"treasury-burn-flexible"},...kt.length?[{label:"Open debt planner",action:"FinancialMode.openAddModal",args:`'debtPlan', '${$e((Sn[0]||kt[0]||{}).id||"")}'`}]:[]]}:Sn.length?$t={title:"Confirm debt payment plans",body:"Monthly pressure is clearer once every liability has a payment plan.",primaryLabel:"Open debt planner",primaryAction:"FinancialMode.openAddModal",primaryArgs:`'debtPlan', '${$e(Sn[0].id)}'`,secondary:[{label:"Review debt pressure",localAction:"open-treasury-panel",section:"treasury-debt-details"}]}:hi>0?$t={title:"Protect priority reserves",body:"Some money still needs a job. Fund the most important bucket first.",primaryLabel:"Add reserve bucket",primaryAction:"openEditModal",primaryArgs:"'reserveBucket'",secondary:[{label:"Allocate cash",action:"openEditModal",args:"'allocateReserves'"}]}:D>w*.35&&D>0&&($t={title:"Review flexible costs",body:"A small cut to discretionary burn can extend your breathing room.",primaryLabel:"Review flexible costs",primaryLocalAction:"open-treasury-panel",primarySection:"treasury-burn-flexible",secondary:[{label:"Add recurring cost",action:"FinancialMode.openAddModal",args:"'expense'"}]}),$t.primaryLocalAction?pe({label:$t.primaryLabel,action:$t.primaryLocalAction,local:!0,variant:"primary",attrs:`data-fin-section="${v($t.primarySection)}"`}):pe({label:$t.primaryLabel,action:$t.primaryAction,args:$t.primaryArgs||"",variant:"primary"}),G($t.secondary).map(ne=>ne.localAction?pe({label:ne.label,action:ne.localAction,local:!0,attrs:`data-fin-section="${v(ne.section||"")}"`}):pe({label:ne.label,action:ne.action,args:ne.args||""})).join("");const aa=[{label:"Cash available",value:Je,tone:"safe"},{label:"Essential costs",value:-w,tone:"essential"},{label:"Flexible costs",value:-D,tone:"flexible"},{label:"Debt pressure",value:-z,tone:"debt"},{label:"Protected reserves",value:we,tone:"protected"},{label:$n>=0?"Resulting surplus":"Resulting shortfall",value:$n,tone:$n>=0?"safe":"critical"}];return`
            ${Gr(i)}

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-pulse ${Rn.className}">
                    <div class="fin-treasury-pulse-main">
                        <span class="fin-eyebrow">Money Plan</span>
                        <div class="fin-treasury-profile-context">${v(i.label)}${i.isProjectView?" project view totals":" canonical totals"}</div>
                        <div class="fin-treasury-free-cash">
                            <span>${i.isProjectView?"Project available cash":"Available cash after protection"}</span>
                            <strong class="${Je<0?"fin-val-neg":"fin-val-pos"}">${j(Je)}</strong>
                        </div>
                        <p>Rules, containers, obligations, and commitments that shape the live cockpit.</p>
                        ${En("availableCash")}
                    </div>
                    <div class="fin-treasury-pulse-side">
                        <div class="fin-treasury-status-chip">Structure</div>
                        <div class="fin-treasury-pulse-grid">
                            <div><span>Cash accounts</span><strong>${a.length}</strong></div>
                            <div><span>Recurring costs</span><strong>${g.length}</strong></div>
                            <div><span>Reserve buckets</span><strong>${s.length}</strong></div>
                            <div><span>Debt plans confirmed</span><strong>${Pi} of ${kt.length}</strong></div>
                            <div><span>Protected</span><strong>${j(we)}</strong>${En("protectedCash")}</div>
                            <div><span>Monthly burn</span><strong>${j(pt)}</strong>${En("monthlyBurnRate")}</div>
                        </div>
                    </div>
                    <div class="fin-treasury-next-move">
                        <span class="fin-eyebrow">Payment plan rule</span>
                        <strong>Only active recurring debt plans affect burn.</strong>
                        <p>The full debt balance stays visible as liability. Monthly, quarterly, yearly, weekly, or biweekly plan payments are normalized into burn.</p>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-flow-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Cash Structure</div>
                            <div class="fin-helper-text">How real balances, protected buckets, near-term obligations, and payment plans shape availability.</div>
                        </div>
                        <span class="fin-status-pill">Planned</span>
                    </div>
                    <div class="fin-treasury-pulse-grid">
                        <div><span>Actual cash</span><strong>${j(se)}</strong>${En("actualCash")}</div>
                        <div><span>Protected cash</span><strong>${j(we)}</strong>${En("protectedCash")}</div>
                        <div><span>Due in 30 days</span><strong>${j(Ut)}</strong></div>
                        <div><span>Payment-plan burn</span><strong>${j(z)}</strong>${En("debtPressure")}</div>
                        <div><span>Total liability</span><strong>${j(vi)}</strong></div>
                        <div><span>Structural runway</span><strong>${v(Ti)}</strong>${En("runway")}</div>
                    </div>
                    <div class="fin-treasury-flow">
                        ${aa.map(ne=>`
                            <div class="fin-treasury-flow-step is-${v(ne.tone)}">
                                <div class="fin-treasury-flow-label"><span>${v(ne.label)}</span><strong>${ne.value>=0?"+":"-"}${j(Math.abs(ne.value))}</strong></div>
                                <div class="fin-treasury-flow-track"><span style="width:${ee(ne.value,ia)}%"></span></div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-vault">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Protected Money</div>
                            <div class="fin-helper-text">Protected cash can come from account allocations and reserve buckets. This money has a job; it is not spare.</div>
                        </div>
                        <div class="fin-action-row">
                            ${pe({label:"Allocate cash",action:"openEditModal",args:"'allocateReserves'"})}
                            ${pe({label:"Add reserve bucket",action:"openEditModal",args:"'reserveBucket'",variant:"primary"})}
                        </div>
                    </div>
                    <div class="fin-treasury-vault-summary">
                        <div><span>Total protected</span><strong>${j(we)}</strong></div>
                        <div><span>Protected account allocations</span><strong>${j(ta)}</strong></div>
                        <div><span>Reserve bucket balances</span><strong>${j(Ei)}</strong></div>
                        <div><span>Reserve target</span><strong>${j(na)}</strong></div>
                        <div><span>Still to protect</span><strong>${j(hi)}</strong></div>
                    </div>
                    <div class="fin-treasury-reserve-grid">
                        ${Le(s)}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-burn">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Recurring Burn</div>
                            <div class="fin-helper-text">Monthly outflow by pressure type. Details stay tucked away until you need them.</div>
                        </div>
                        ${pe({label:"Add recurring cost",action:"FinancialMode.openAddModal",args:"'expense'"})}
                    </div>
                    <div class="fin-treasury-burn-grid">
                        <div><span>Total monthly burn</span><strong>${j(pt)}</strong></div>
                        <div><span>Essential</span><strong>${j(w)}</strong><small>${en(S.length,"item")}</small></div>
                        <div><span>Flexible</span><strong>${j(D)}</strong><small>${en($.length,"item")}</small></div>
                        <div><span>Debt payment plans</span><strong>${j(z)}</strong><small>${en(kt.length,"liability","liabilities")}</small></div>
                    </div>
                    ${Dt("treasury-burn-essential","Essential Costs",`${j(w)} / month · ${en(S.length,"item")}`,be(S,"Essential"))}
                    ${Dt("treasury-burn-flexible","Flexible Costs",`${j(D)} / month · ${en($.length,"item")}`,be($,"Flexible"))}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-debt">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Debt & Payment Plans</div>
                            <div class="fin-helper-text">The liability balance is separate from the active payment plan pressure added to burn.</div>
                        </div>
                        ${pe({label:"Add debt item",action:"FinancialMode.openAddModal",args:"'debtAdd'"})}
                    </div>
                    <div class="fin-treasury-pressure-line">
                        <div><span>Total debt</span><strong>${j(vi)}</strong></div>
                        <div><span>Payment-plan burn</span><strong>${j(z)}</strong></div>
                        <div><span>Liabilities</span><strong>${kt.length}</strong></div>
                        <div><span>Plans missing</span><strong>${Sn.length}</strong></div>
                    </div>
                    ${Yn(kt)}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-goals">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings & Future Goals</div>
                            <div class="fin-helper-text">${Je<0?"Pause future goals until the current shortfall is covered.":"Future goals sit below immediate Money Plan pressure."}</div>
                        </div>
                        ${pe({label:Pn.length?"Manage goals":"Add goal",action:"openEditModal",args:`'${Pn.length?"goals":"goal"}'`})}
                    </div>
                    ${Pn.length?`
                        <div class="fin-goals-grid">
                            ${Pn.map(ne=>`
                                <div class="fin-goal-item">
                                    <div class="fin-goal-meta">
                                        <span><strong>${v(ne.name)}</strong><small>${v(ne.type)} · ${v(ne.scope)}${ne.targetDate?" · by "+ke(ne.targetDate):""}</small></span>
                                        <span>${Math.round(ne.progressPercent)}%</span>
                                    </div>
                                    <div class="fin-goal-track"><span style="width:${ne.progressPercent}%"></span></div>
                                    <div class="fin-goal-values"><span>${j(ne.currentAmount)}</span><span>of ${j(ne.targetAmount)}</span></div>
                                </div>
                            `).join("")}
                        </div>
                    `:Me("Set one useful future goal after the current Money Plan pressure is understood.")}
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-treasury-accounts">
                    ${Dt("treasury-accounts","Account Details",`${j(se)} across ${en(a.length,"cash account")}`,`
                        <div class="fin-section-heading-row">
                            <div>
                                <div class="fin-helper-text">Manage real-world cash accounts without letting rows dominate Money Plan.</div>
                            </div>
                            ${pe({label:"Add cash account",action:"openEditModal",args:"'fiatAccount'"})}
                        </div>
                        ${a.length?a.map(ne=>`
                            ${qt({title:ne.name,meta:`${ne.scope||"shared"} · ${ne.reserved?"protected cash":"available cash"}${ne.bucket?` · ${String(ne.bucket).replace(/_/g," ")}`:""}${ne.projectId?" · project plan":""}`,amount:j(ne.balance),iconHtml:Fe("cash",{size:"sm",tone:ne.reserved?"accent":"success"}),actionHtml:me({action:"openEditModal",args:`'fiatAccount', '${$e(ne.id)}'`,label:`Edit ${ne.name||"cash account"}`}),extraClass:"fin-board-list-row"})}
                        `).join(""):Me("Establish your plan. Add your primary operating account.")}
                    `)}
                </div>
            </section>
        `}function Yr(){const i=G(e?.recurringExpenses),a=G(e?.debtAccounts),s={};try{const E=localStorage.getItem("finance-master.ui.expenseOrder");E&&JSON.parse(E).forEach((se,we)=>s[se]=we)}catch{}i.sort((E,ce)=>{const se=s.hasOwnProperty(E.id)?s[E.id]:99999,we=s.hasOwnProperty(ce.id)?s[ce.id]:99999;return se-we});const l=i.reduce((E,ce)=>E+(Number(ce.monthlyAmount)||0),0),g=ge("totalMonthlyBurn",Number(t?.monthlyBurn)||l),S=i.filter(E=>E.essential),$=i.filter(E=>!E.essential),w=S.reduce((E,ce)=>E+(Number(ce.monthlyAmount)||0),0),D=$.reduce((E,ce)=>E+(Number(ce.monthlyAmount)||0),0),z=La("debtBurden",a.reduce((E,ce)=>E+(Number(ce.outstanding)||0),0)),k=a.reduce((E,ce)=>E+it(ce),0),M=(E,ce,se,we)=>`
            <div class="fin-board-panel fin-list-item">
                ${qt({title:E.category,meta:`Due day ${String(E.dueDay)} · ${E.scope||"shared"} · ${we}`,amount:`${j(E.monthlyAmount)} / mo`,iconHtml:Fe("calendar",{size:"sm",tone:we==="Essential"?"accent":"muted"}),actionHtml:`
                        <div class="fin-inline-icon-actions">
                            ${me({action:"FinancialMode.moveExpense",args:`'${$e(E.id)}', '-1'`,label:`Move ${E.category||"cost"} up`,icon:"arrow-up",tone:"muted",extraClass:ce===0?"is-disabled":"",attrs:ce===0?'disabled aria-disabled="true"':""})}
                            ${me({action:"FinancialMode.moveExpense",args:`'${$e(E.id)}', '1'`,label:`Move ${E.category||"cost"} down`,icon:"arrow-down",tone:"muted",extraClass:ce===se.length-1?"is-disabled":"",attrs:ce===se.length-1?'disabled aria-disabled="true"':""})}
                            ${me({action:"FinancialMode.openAddModal",args:`'expense', '${$e(E.id)}'`,label:`Edit ${E.category||"recurring cost"}`})}
                        </div>
                    `,extraClass:"fin-board-list-row"})}
            </div>
        `;return`
            <section class="fin-section">
                <!-- Summary KPIs -->
                <div class="fin-snapshot-grid fin-snapshot-grid--cockpit">
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Monthly burn</div>
                        <div class="fin-tile-value">${j(g)}</div>
                        <div class="fin-tile-subline">${en(i.length,"recurring cost")}</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Essential</div>
                        <div class="fin-tile-value">${j(w)}</div>
                        <div class="fin-tile-subline">${en(S.length,"item")} · cannot cut</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Flexible</div>
                        <div class="fin-tile-value">${j(D)}</div>
                        <div class="fin-tile-subline">${en($.length,"item")} · can reduce</div>
                    </div>
                    <div class="widget ui-card glass fin-tile">
                        <div class="fin-tile-label">Total debt</div>
                        <div class="fin-tile-value fin-text-med">${j(z)}</div>
                        <div class="fin-tile-subline">${en(a.length,"liability","liabilities")}</div>
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
                    ${pe({label:"Add recurring cost",action:"FinancialMode.openAddModal",args:"'expense'"})}
                </div>
                ${S.length?S.map((E,ce)=>M(E,ce,S,"Essential")).join(""):Me("Define your survival burn. What fixed costs keep the business alive?")}
            </section>

            <!-- Flexible Costs -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Flexible Costs</div>
                        <div class="fin-helper-text">Subscriptions and discretionary spend. These are your first candidates for cutting.</div>
                    </div>
                </div>
                ${$.length?$.map((E,ce)=>M(E,ce,$,"Flex")).join(""):Me("Define your comfort burn. What costs are nice-to-have?")}
            </section>

            <!-- Debt Items -->
            <section class="fin-section">
                <div class="fin-section-heading-row">
                    <div>
                        <div class="widget-title ui-title">Debt & Liabilities</div>
                        <div class="fin-helper-text">Credit lines, loans, and other negative balances.${k>0?` Combined minimum payments: ${j(k)} / mo.`:""}</div>
                    </div>
                    ${pe({label:"Add debt item",action:"FinancialMode.openAddModal",args:"'debtAdd'"})}
                </div>
                ${a.length?a.map(E=>{const ce=wn(E),se=it(E),we=E.totalAdded>0?Math.min(100,Math.round((E.totalPaid||0)/E.totalAdded*100)):0;return`
                    <div class="fin-board-panel fin-debt-card">
                        ${qt({title:E.name,meta:`${E.scope||"shared"}${E.dueDate?` · Due ${ke(E.dueDate)}`:""}`,amount:j(E.outstanding),amountClass:"fin-text-med",iconHtml:Fe("debt",{size:"sm",tone:ce?"muted":"danger"}),actionHtml:`
                                <div class="fin-inline-icon-actions">
                                    ${me({action:"FinancialMode.openAddModal",args:`'debtPayment', '${$e(E.id)}'`,label:`Record payment for ${E.name||"debt item"}`,icon:"success",tone:"success"})}
                                    ${me({action:"FinancialMode.openAddModal",args:`'debtPlan', '${$e(E.id)}'`,label:`Edit payment plan for ${E.name||"debt item"}`})}
                                    ${me({action:"FinancialMode.openAddModal",args:`'debtAdd', '${$e(E.id)}'`,label:`Edit ${E.name||"debt item"}`})}
                                </div>
                            `,extraClass:"fin-debt-header fin-board-list-row"})}
                        ${E.totalAdded>0?`
                        <div class="fin-debt-progress">
                            <div class="fin-debt-bar-track">
                                <div class="fin-debt-bar-fill" style="width: ${we}%"></div>
                            </div>
                            <div class="fin-debt-bar-label">${j(E.totalPaid||0)} paid of ${j(E.totalAdded)} · ${we}%</div>
                        </div>
                        `:""}
                        <div class="fin-debt-details">
                            ${E.planType==="custom"?`<span>Custom Plan: ${E.installments?.length||0} installments</span>`:se>0?`<span>${Ci(E)} pressure: ${j(se)} / month</span>`:""}
                            ${String(E.paymentPlanNote||"").trim()?`<span>Plan note: ${v(E.paymentPlanNote)}</span>`:""}
                            ${E.estimatedPayoffDate?`<span>Projected payoff: ${ke(E.estimatedPayoffDate)}${Number.isFinite(Number(E.estimatedPayoffMonths))&&Number(E.estimatedPayoffMonths)>0?` · ${Number(E.estimatedPayoffMonths)} months`:""}</span>`:""}
                            ${ce?"":`<span class="fin-debt-warning">${Fe("warning",{size:"xs",tone:"danger"})} Missing payment plan</span>`}
                        </div>
                    </div>
                `}).join(""):Me("Debt-free operations.")}
            </section>
        `}function Qr(){const i=window.Store.getFinanceSettings(),a=window.Store.getUiSettings(),s=a.scopeFilter==="business"?"Business only":a.scopeFilter==="personal"?"Personal only":"All scopes",l=a.reducedMotion?"On":"Off";return`
            <section class="fin-section">
                <!-- App Preferences -->
                <div class="widget ui-card glass fin-card fin-board-frame fin-settings-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">App Preferences</div>
                            <div class="fin-helper-text">App-level defaults only. Money management stays in the product boards.</div>
                        </div>
                    </div>
                    <div class="fin-settings-form">
                        <div class="form-group">
                            <label for="page-settings-currency">Base currency</label>
                            <input id="page-settings-currency" value="${v(i.baseCurrency||"EUR")}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-forecast">Forecast horizon (days)</label>
                            <input id="page-settings-forecast" type="number" value="${v(i.forecastDays||90)}" />
                        </div>
                        <div class="form-group">
                            <label for="page-settings-scope">Default scope filter</label>
                            <select id="page-settings-scope">
                                <option value="all"${a.scopeFilter==="all"?" selected":""}>All scopes</option>
                                <option value="business"${a.scopeFilter==="business"?" selected":""}>Business only</option>
                                <option value="personal"${a.scopeFilter==="personal"?" selected":""}>Personal only</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="page-settings-appearance">Visual mode</label>
                            <select id="page-settings-appearance">
                                <option value="dark-editorial"${a.appearance==="dark-editorial"?" selected":""}>Dark Editorial</option>
                                <option value="dark-restrained"${a.appearance==="dark-restrained"?" selected":""}>Dark Restrained</option>
                                <option value="bright-editorial"${a.appearance==="bright-editorial"?" selected":""}>Bright Editorial</option>
                                <option value="bright-minimal"${a.appearance==="bright-minimal"?" selected":""}>Bright Minimal</option>
                                <option value="color-field"${a.appearance==="color-field"?" selected":""}>Color Field</option>
                                <option value="monochrome-focus"${a.appearance==="monochrome-focus"?" selected":""}>Monochrome Focus</option>
                            </select>
                        </div>
                        <label class="settings-check">
                            <input id="page-settings-reduced-motion" type="checkbox"${a.reducedMotion?" checked":""} />
                            <span>Reduced motion</span>
                        </label>
                        <div class="fin-settings-actions">
                            ${pe({label:"Apply preferences",action:"FinancialMode.saveSettingsPage",variant:"primary"})}
                        </div>
                    </div>
                    <div class="fin-settings-impact-summary" aria-label="Current preference impact">
                        <div><span>Base currency</span><strong>${v(i.baseCurrency||"EUR")}</strong></div>
                        <div><span>Forecast window</span><strong>${Number(i.forecastDays||90)} days</strong></div>
                        <div><span>Default scope</span><strong>${v(s)}</strong></div>
                        <div><span>Reduced motion</span><strong>${v(l)}</strong></div>
                    </div>
                </div>

                <div class="widget ui-card glass fin-card fin-board-frame fin-settings-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Product boundaries</div>
                            <div class="fin-helper-text">
                                Finance Master stays local-first. Backup, restore, sample data, reset controls, and app preferences live in Settings. CSV records and import mappings live in Records.
                            </div>
                        </div>
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
        `}function dn(i){return G(o&&o[i])}function ge(i,a=0){const s=Number(o&&o[i]);return Number.isFinite(s)?s:a}function La(i,a=0){const s=Number(c&&c[i]&&c[i].value);return Number.isFinite(s)?s:a}function Zr(i){return i==="subtract"?"Subtract":i==="divide"?"Divide by":i==="multiply"?"Multiply by":"Add"}function Jr(i,a){const s=String(i&&i.key||""),l=Number(a)||0;return s==="runway"?`${l.toFixed(1)} months`:s==="forecastConfidence"?`${Math.round(l)}%`:j(l)}function En(i){const a=c&&c[i];if(!a||!Array.isArray(a.parts))return"";const s=String(a.label||i);return`<span class="fin-metric-info" data-fin-explainer="${v(i)}">${mn(i,s)}</span>`}function Xr(i){const s=(Array.isArray(i)?i:[i]).map(l=>c&&c[l]).filter(l=>l&&Array.isArray(l.parts));return s.length?`
            <div class="fin-info-formula">
                ${s.map(l=>`
                    <div class="fin-info-formula-group" aria-label="${v(l.label||"Metric")} formula">
                        ${s.length>1?`<div class="fin-info-formula-title">${v(l.label||"Metric")}</div>`:""}
                        ${l.parts.map(g=>`
                            <div class="fin-info-formula-row">
                                <span>${Zr(g.operation)} ${v(g.label)}</span>
                                <strong>${Jr(l,g.value)}</strong>
                            </div>
                        `).join("")}
                        ${G(l.warnings).map(g=>`
                            <div class="fin-info-formula-note">${v(g)}</div>
                        `).join("")}
                    </div>
                `).join("")}
            </div>
        `:""}function eo(){const i=G(e&&e.fiatAccounts).slice(0,6);return`
            <section class="fin-info-popover-section">
                <h4>Account sources</h4>
                <div class="fin-info-account-list">
                    ${i.length?i.map(a=>`
                        <div class="fin-info-formula-row">
                            <span>${v(a.name||"Cash account")}</span>
                            <strong>${j(a.balance,a.currency)}</strong>
                        </div>
                    `).join(""):'<div class="fin-info-formula-note">No cash accounts are configured yet.</div>'}
                </div>
            </section>
        `}function to(){return{...{actualCash:{title:"Actual Cash",formula:"actualCash",sections:[{label:"What it means",body:"The sum of liquid cash account balances only."},{label:"Data sources",body:"Cash accounts marked as liquid operating or personal accounts."},{label:"Check if wrong",body:"Review account balances and remove any forecasted income that was entered as cash."}]},protectedCash:{title:"Protected Cash",formula:"protectedCash",sections:[{label:"What it means",body:"Money that exists but is reserved for taxes, VAT, debt, buffer, or another named purpose."},{label:"Data sources",body:"Active reserve buckets and protected account allocations."},{label:"Check if wrong",body:"Review reserve bucket balances, targets, and active status in Money Plan."}]},availableCash:{title:"Available Cash",formula:"availableCash",sections:[{label:"What it means",body:"Actual cash after protected cash and committed near-term obligations are accounted for."},{label:"Why it matters",body:"This is the operating number that separates spare-looking money from money already spoken for."},{label:"Check if wrong",body:"Review cash accounts, reserve buckets, obligations due soon, and debt payment plans."}]},monthlyBurnRate:{title:"Monthly Burn Rate",formula:"monthlyBurnRate",sections:[{label:"What it means",body:"Normalized monthly pressure from recurring costs and active debt payment plans."},{label:"Data sources",body:"Essential costs, flexible recurring costs, and debt plans normalized to a monthly amount."},{label:"Check if wrong",body:"Review recurrence settings, cost category, and active debt payment-plan cadence."}]},debtPressure:{title:"Debt Pressure",formula:"debtPressure",sections:[{label:"What it means",body:"The monthly burn added by active debt payment plans."},{label:"Why it matters",body:"Debt balances are liabilities, but active payment plans also affect monthly operating pressure."},{label:"Check if wrong",body:"Open Money Plan and confirm every active debt has the right payment cadence and amount."}]},forecastConfidence:{title:"Forecast Confidence",formula:"forecastConfidence",sections:[{label:"What it means",body:"A confidence signal based on how complete and review-ready the local finance data is."},{label:"Data sources",body:"Cash accounts, income status, obligations, debt plans, and open review items."},{label:"Check if wrong",body:"Clear review items and update uncertain income or obligations."}]}},safeToSpend:{title:"Safe-to-Spend",formula:"safeToSpend",sections:[{label:"What it means",body:"The amount available for the next 30 days after protected cash, obligations, debt plans, and buffer."},{label:"Why it matters",body:"It shows what can be used without damaging near-term stability."},{label:"Check if wrong",body:"Review cash accounts, protected reserves, recurring obligations, and debt plan status."}]},currentCash:{title:"Current Cash",formula:["actualCash","protectedCash","availableCash"],extraHtml:eo(),sections:[{label:"What it means",body:"Actual liquid cash, protected cash, and the amount left after current commitments."},{label:"Data sources",body:"Cash accounts, reserve buckets, near-term obligations, and active payment-plan pressure."},{label:"Check if wrong",body:"Update account balances, reserve bucket balances, and obligations due soon."}]},runway:{title:"Runway",formula:"runway",sections:[{label:"What it means",body:"How many months available cash can cover the current monthly burn rate."},{label:"Why it matters",body:"Protected-cash-adjusted runway is the useful survival signal, not total account balance."},{label:"Check if wrong",body:"Review recurring costs, debt payment plans, reserve protection, and cash accounts."}]},decisionLab:{title:"Decision Lab",sections:[{label:"What it means",body:"Decision Lab turns local cash, runway, obligations, reserves, and review state into an action queue."},{label:"How it is chosen",body:"It ranks focus items, decision cards, pressure windows, and opportunities without mutating financial data."},{label:"Check if wrong",body:"Open Money Plan, Cash Timeline, or Reality Check to update stale inputs before acting on a decision."}]},todaysFocus:{title:"Suggested Next Move",sections:[{label:"What it means",body:"The single most useful next move based on cash pressure, overdue items, missing plans, and review cadence."},{label:"How it is chosen",body:"Projected gaps, overdue obligations, missing payment plans, review readiness, and missing inputs are prioritized."},{label:"Check if wrong",body:"Open Reality Check, Cash Timeline, or Money Plan to clear stale records and confirm upcoming money movement."}]},nextMoneyIn:{title:"Next Money In",sections:[{label:"What it means",body:"The next active expected income item that is more concrete than a lead or risky proposal."},{label:"Data sources",body:"Cash Timeline income records, expected dates, status, and probability."},{label:"Check if wrong",body:"Update the income status, expected date, amount, or reliability in Cash Timeline."}]},nextObligations:{title:"Next Obligations",sections:[{label:"What it means",body:"Upcoming costs already spoken for, including recurring obligations and debt payment plan pressure."},{label:"How it is ordered",body:"Unpaid obligations are sorted by due date, with the closest items shown first."},{label:"Check if wrong",body:"Open Money Plan to update recurring costs, due dates, payment plans, or paid/deferred status."}]},financialWeather:{title:"Financial Weather",sections:[{label:"What it means",body:"A summary condition based on cash, forecast, obligations, runway, reserves, and open review items."},{label:"How it is calculated",body:"It reads available cash, expected income, upcoming obligations, debt plan pressure, review uncertainty, and runway trend."},{label:"Why it matters",body:"It gives a fast read on whether the financial system is calm or under pressure."}]},trendStrip:{title:"Tiny Trend Strip",sections:[{label:"What it means",body:"A compact set of source signals for near-term net movement, burn, reserves, and the forecast low point."},{label:"How to use it",body:"Open the source board for detail when one of the small signals looks out of range."}]}}}function no(){if(!q)return"";const i=to()[q];return i?Ml({title:i.title,sections:i.sections,formulaHtml:i.formula?Xr(i.formula):"",extraHtml:i.extraHtml||""}):""}function fi(i){const a=String(i&&(i.status||i.stage)||"expected").toLowerCase().replace(/\s+/g,"_").replace(/-/g,"_");return a==="open"||a==="manual_expected_income"?"expected":a==="signed"||a==="verbal_commitment"?"confirmed":a==="invoice_sent"||a==="sent"?"invoiced":a==="received"||a==="settled"||a==="closed"?"paid":a==="deleted"?"cancelled":a==="opportunity"?"lead":["lead","proposal","expected","confirmed","invoiced","due","overdue","paid","cancelled","lost","risky"].includes(a)?a:"expected"}function ki(i,a){const s=String(i&&i.dueState||"").toLowerCase();if(s)return s;if(a==="paid")return"settled";if(a==="cancelled"||a==="lost")return"inactive";const l=window.FinanceDates?.toDateOnly?.(i&&i.expectedDateISO)||String(i&&i.expectedDateISO||"").slice(0,10),g=window.FinanceDates?.todayDateOnly?.()||new Date().toISOString().slice(0,10);if(!l||!g)return"upcoming";if(l<g)return Date.parse(`${g}T00:00:00.000Z`)-Date.parse(`${l}T00:00:00.000Z`)>336*60*60*1e3?"severely_overdue":"overdue";if(l===g||a==="due")return"due_today";const S=window.FinanceDates?.addDaysDateOnly?.(g,7)||"";return S&&l<=S?"due_soon":"upcoming"}function Zi(i){const a=String(i||"").trim();if(!a)return"";const s=G(e&&e.projectProfiles).find(l=>String(l&&l.id||"")===a);return s?String(s.name||""):"Project plan"}function Fi(i){const a=String(i&&i.incomeType||"").toLowerCase();if(a!=="retainer"&&a!=="recurring")return"";const s=Number(i&&i.durationValue),l=String(i&&i.durationUnit||"").toLowerCase();if(!Number.isFinite(s)||s<=0||!["months","hours","times"].includes(l))return"";const g=Math.round(s*10)/10;return`${g} ${g===1?l==="months"?"month":l==="hours"?"hour":"time":l}`}function Ua(i){const a=String(i&&i.status||""),s=String(i&&i.dueState||"");return a==="paid"?"Settled":a==="cancelled"||a==="lost"?"Inactive":s==="severely_overdue"?"Severely overdue":s==="overdue"?"Overdue":s==="due_today"?"Due today":s==="due_soon"?"Due soon":["confirmed","invoiced","due","overdue"].includes(a)?"High reliability":a==="expected"||i.incomeType==="retainer"||i.incomeType==="recurring"?"Expected":"Early signal"}function io(i={}){const a=!!(i&&i.compact),s=Y(),l=yt().map(M=>{const E=fi(M),ce=Number(M&&M.probability),se=Number.isFinite(ce)?Math.max(0,Math.min(1,ce)):0;return{id:String(M&&M.id||""),title:String(M&&M.title||"Expected income"),amount:Number(M&&M.value)||0,netAmount:Number.isFinite(Number(M&&M.netAmount))?Number(M.netAmount):null,vatRate:Number.isFinite(Number(M&&M.vatRate))?Number(M.vatRate):0,vatAmount:Number.isFinite(Number(M&&M.vatAmount))?Number(M.vatAmount):0,grossAmount:Number.isFinite(Number(M&&M.grossAmount))?Number(M.grossAmount):Number(M&&M.value)||0,probability:se,weightedAmount:Number.isFinite(Number(M&&M.weightedAmount))?Number(M.weightedAmount):(Number(M&&M.value)||0)*se,expectedDateISO:M&&M.expectedDateISO,settlementAccount:String(M&&M.destinationAccountName||M&&M.destinationAccountId||""),incomeType:String(M&&M.incomeType||"one_off"),durationValue:M&&M.durationValue,durationUnit:M&&M.durationUnit,status:E,dueState:ki(M,E),projectLabel:Zi(M&&M.projectId)}}),g=G(e&&e.invoices).filter(M=>String(M&&M.status||"").toLowerCase()==="paid").slice(0,8).map(M=>({id:String(M&&M.id||""),title:String(M&&(M.client||M.title)||"Paid income"),amount:Number(M&&M.amount)||0,probability:1,weightedAmount:Number(M&&M.amount)||0,expectedDateISO:M&&(M.paidAt||M.sentAt),settlementAccount:String(M&&M.destinationAccountName||""),incomeType:"one_off",status:"paid",dueState:"settled",projectLabel:Zi(M&&M.projectId)}));let S=[];s==="rhythm"?S=[]:s==="open"?S=l.sort((M,E)=>(Date.parse(M.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)-(Date.parse(E.expectedDateISO||"")||Number.MAX_SAFE_INTEGER)):s==="settled"?S=g.sort((M,E)=>(Date.parse(E.expectedDateISO||"")||0)-(Date.parse(M.expectedDateISO||"")||0)):S=l.concat(g).sort((M,E)=>(Date.parse(E.expectedDateISO||"")||0)-(Date.parse(M.expectedDateISO||"")||0));const $=l.reduce((M,E)=>{const ce=String(E.status||"");return["confirmed","invoiced","due","overdue"].includes(ce)&&(M.reliable+=E.amount),(ce==="expected"||E.incomeType==="retainer"||E.incomeType==="recurring")&&(M.expected+=E.amount),(ce==="proposal"||ce==="lead"||ce==="risky")&&(M.early+=E.amount),(E.dueState==="overdue"||E.dueState==="severely_overdue")&&(M.overdue+=E.amount),M},{reliable:0,expected:0,early:0,overdue:0}),w=l.reduce((M,E)=>M+(Number(E.weightedAmount)||0),0),D=l.map(M=>({title:M.title||"Expected income",weighted:Number(M.weightedAmount)||0})).sort((M,E)=>E.weighted-M.weighted).slice(0,4),z=jt(),k=s==="rhythm"?nt(z):`
                <div class="fin-table-wrap fin-table-wrap--spaced">
                    ${S.length?`
                        <table class="fin-table fin-table--compact">
                            <thead><tr><th>Source</th><th>Status</th><th>Due state</th><th>Expected / paid</th><th>Reliability</th><th style="text-align:right">Weighted</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>
                            <tbody>
                                ${S.map(M=>`
                                    <tr>
                                        <td>${v(M.title)}<small>${v([M.incomeType==="retainer"?"retainer":M.incomeType==="recurring"?"recurring":"",Fi(M),M.projectLabel,M.settlementAccount].filter(Boolean).join(" · "))}</small>${Number(M.vatAmount)>0?`<small>VAT ${j(M.vatAmount)} (${v(String(M.vatRate||0))}%) on top</small>`:""}</td>
                                        <td>${Ft(M.status)}</td>
                                        <td>${Ft(M.dueState)}</td>
                                        <td>${M.expectedDateISO?ke(M.expectedDateISO):"No date"}</td>
                                        <td>${Math.round(M.probability*100)}%<small>${v(Ua(M))}</small></td>
                                        <td style="text-align:right">${j(M.weightedAmount)}</td>
                                        <td style="text-align:right">${j(M.amount)}</td>
                                        <td style="text-align:right">
                                            ${M.status==="paid"?"":`
                                                <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                                    ${me({action:"FinancialMode.openAddModal",args:`'income', '${$e(M.id)}'`,label:`Edit ${M.title||"expected income"}`})}
                                                    ${me({action:"markAsPaid",args:`'${$e(M.id)}'`,label:`Mark ${M.title||"expected income"} as received`,icon:"success",tone:"success"})}
                                                </span>
                                            `}
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    `:Me("Forecast future income. What is the next expected payment?")}
                </div>
                ${l.length&&D.length&&s!=="settled"?`
                    <div class="fin-tab-subsection">
                        <div class="fin-muted fin-subtitle">Dependencies</div>
                        ${D.map(M=>{const E=w>0?Math.round(M.weighted/w*100):0;return`<div class="fin-row-inline"><span>${v(M.title)}</span><span class="fin-muted">${E}%</span></div>`}).join("")}
                    </div>
                `:""}
            `;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame ${a?"fin-income-lane-card":""}">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Income Timing</div>
                            <div class="fin-helper-text">Expected money stays forecasted here until it settles into account cash.</div>
                        </div>
                        ${pe({label:"Add expected income",action:"FinancialMode.openAddModal",args:"'income'"})}
                    </div>
                    <div class="fin-status-grid">
                        <div class="fin-status-card">${Ft("confirmed")}<strong>${j($.reliable)}</strong><span>Confirmed, invoiced, due, or overdue</span></div>
                        <div class="fin-status-card">${Ft("expected")}<strong>${j($.expected)}</strong><span>Expected, retainer, or recurring income</span></div>
                        <div class="fin-status-card">${Ft("proposal")}<strong>${j($.early)}</strong><span>Proposal, lead, or legacy low-confidence income</span></div>
                        <div class="fin-status-card">${Ft("overdue")}<strong>${j($.overdue)}</strong><span>Needs follow-up</span></div>
                    </div>
                    
                    <div class="fin-tabs" role="tablist" aria-label="Income view modes">
                        <button class="fin-tab-btn ${s==="open"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="open">Open Income</button>
                        <button class="fin-tab-btn ${s==="settled"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="settled">Settled</button>
                        <button class="fin-tab-btn ${s==="all"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="all">All</button>
                        <button class="fin-tab-btn ${s==="rhythm"?"active":""}" type="button" data-fin-action="set-invoices-view" data-fin-invoices-view="rhythm">Rhythm</button>
                    </div>

                    <div class="fin-tab-panel">
                        ${k}
                    </div>
                </div>
            </section>
        `}function Zn(i){return{Low:0,Medium:1,High:2,Critical:3}[i]??0}function ao(i){const a=String(i||"Low");return`<span class="fin-insights-risk-pill is-${v(a.toLowerCase())}">${v(a)}</span>`}function ro(i,a){const s=Number(i),l=Number(a);return!Number.isFinite(s)||!Number.isFinite(l)||l<=0?0:Math.max(0,Math.min(100,Math.round(s/l*100)))}function za(i){const a=Number(i);if(!Number.isFinite(a)||a<=0)return"";const s=new Date;return s.setMonth(s.getMonth()+Math.ceil(a)),s.toISOString().slice(0,10)}function oo(i,a){const s=String(i&&(i.estimatedPayoffDate||i.payoffDate||i.debtFreeDate)||"");if(s)return s;const l=Math.max(0,Number(i&&i.outstanding)||0),g=Number.isFinite(Number(a))?Number(a):it(i);return l<=0?new Date().toISOString().slice(0,10):g<=0?"":za(Math.ceil(l/g))}function so(){const i=new Map,a=(w,D,z)=>{const k=String(w||"Unknown source").trim()||"Unknown source",M=Math.max(0,Number(D)||0);if(M<=0)return;const E=i.get(k)||{source:k,amount:0,count:0,kinds:new Set};E.amount+=M,E.count+=1,z&&E.kinds.add(z),i.set(k,E)};G(e&&e.invoices).forEach(w=>{const D=String(w&&w.status||"").toLowerCase();D==="cancelled"||D==="lost"||D==="deleted"||a(w&&(w.client||w.source||w.title),w&&w.amount,D==="paid"?"paid":"invoice")}),G(e&&e.pipelineDeals).forEach(w=>{const D=String(w&&w.status||"").toLowerCase();D==="cancelled"||D==="lost"||D==="deleted"||a(w&&(w.client||w.source||w.title),w&&(w.value||w.amount),D||"expected")}),i.size||G(e&&e.transactions).forEach(w=>{const D=String(w&&(w.ledgerType||w.type)||"").toLowerCase(),z=Number(w&&(w.signedAmount??w.amount));!D.includes("income")&&z<=0||a(w&&(w.client||w.source||w.note||w.description||w.categoryId),Math.abs(z||0),"recorded")});const s=Array.from(i.values()).reduce((w,D)=>w+D.amount,0),l=Array.from(i.values()).sort((w,D)=>D.amount-w.amount).slice(0,5).map(w=>({source:w.source,amount:w.amount,pct:ro(w.amount,s),count:w.count,kinds:Array.from(w.kinds).slice(0,3).join(", ")})),g=l[0]||null,S=g&&g.pct>=80?"Critical":g&&g.pct>=55?"High":g&&g.pct>=40?"Medium":"Low",$=g?`${g.pct}% of tracked income comes from ${g.source}. ${g.pct>50?"Efficient short-term, fragile long-term.":"Dependency is within a healthier range."}`:"Income dependency becomes visible once expected or settled income is tracked.";return{total:s,rows:l,top:g,risk:S,interpretation:$}}function co(){const i=p(e&&e.recurringExpenses),a=i.filter(k=>k&&k.essential),s=i.filter(k=>!k||!k.essential),l=a.reduce((k,M)=>k+(Number(M.monthlyAmount)||0),0),g=s.reduce((k,M)=>k+(Number(M.monthlyAmount)||0),0),S=G(e&&e.debtAccounts).reduce((k,M)=>k+it(M),0),$=G(e&&e.reserveBuckets).filter(k=>/tax|vat/i.test(String(k&&(k.purpose||k.name)||""))).reduce((k,M)=>k+Math.max(0,(Number(M.targetAmount)||0)-(Number(M.currentAmount)||0)),0),w=a[0]||null,D=s[0]||null,z=[{label:"non-negotiable costs",value:l},{label:"adjustable costs",value:g},{label:"debt payment pressure",value:S}].sort((k,M)=>M.value-k.value)[0];return{essential:a,flexible:s,essentialTotal:l,flexibleTotal:g,debtMonthly:S,taxReserveGap:$,biggestFixed:w,biggestFlexible:D,potentialImpact:Math.min(Math.max(0,g),200),interpretation:z&&z.value>0?`${z.label.charAt(0).toUpperCase()}${z.label.slice(1)} is the strongest monthly pull right now.`:"Expense gravity becomes clearer once recurring costs and debt plans are added."}}function lo(i){const a=G(e&&e.debtAccounts).filter(D=>Math.max(0,Number(D&&D.outstanding)||0)>0),s=ge("debtRemaining",a.reduce((D,z)=>D+(Number(z.outstanding)||0),0)),l=Number(i&&i.debtMonthly)||a.reduce((D,z)=>D+it(z),0),g=a.slice().sort((D,z)=>(Number(z&&z.outstanding)||0)-(Number(D&&D.outstanding)||0))[0]||null,S=g?oo(g):"",$=Number(e&&e.incomeReceivedLast30Days)||0,w=l<=Math.max(1,$*.35);return{debts:a,totalDebt:s,monthlyPressure:l,largest:g,payoffDate:S,realistic:w,interpretation:a.length?w?"Payment pressure appears manageable against recent income rhythm.":"Payment pressure may be heavy for the current income rhythm.":"No active debt pressure is visible."}}function uo(){const i=G(e&&e.reserveBuckets),a=ge("protectedCash",Number(t&&t.reservedCash)||0),s=i.reduce((z,k)=>z+Math.max(0,Number(k&&k.targetAmount)||0),0),l=i.reduce((z,k)=>z+Math.max(0,(Number(k&&k.targetAmount)||0)-(Number(k&&k.currentAmount)||0)),0),g=s>0?Math.round(a/s*100):0,S=i.find(z=>/tax|vat/i.test(String(z&&(z.purpose||z.name)||""))),$=i.find(z=>/emergency|buffer|safety/i.test(String(z&&(z.purpose||z.name)||""))),w=ge("availableCash",Number(t&&t.availableCash)||0);let D="Build a €500 micro-buffer before larger savings goals.";return w<0?D="Pause future savings goals until the current shortfall is covered.":g>=100&&(D="Keep reserve discipline steady and review targets monthly."),{buckets:i,protectedCash:a,target:s,gap:l,coverage:g,taxBucket:S,emergencyBucket:$,recommendation:D}}function mo({dependency:i,expenseGravity:a,debt:s,reserve:l}){const g=ge("availableCash",Number(t&&t.availableCash)||0),S=ge("committedShortTermObligations",0),$=ge("totalMonthlyBurn",Number(t&&t.monthlyBurn)||0),w=G(r&&r.history).length,D=jt(),z=Number(a&&a.taxReserveGap)||0;return[{name:"Liquidity risk",level:g<0?"Critical":g<S?"High":g<$?"Medium":"Low",metric:j(g),explanation:g<0?"Available cash is negative after protected cash and upcoming obligations.":"Available cash covers the current short-term view.",impact:g<0?"Can block near-term decisions until cash or obligations are adjusted.":"Near-term commitments are not currently crowding available cash.",actionLabel:g<0?"Open Cash Timeline":"Review Money Status",actionRoute:g<0?"flow":"dashboard"},{name:"Debt pressure",level:s.monthlyPressure>a.essentialTotal?"High":s.monthlyPressure>$*.25?"Medium":"Low",metric:j(s.monthlyPressure),explanation:s.monthlyPressure>0?"Monthly debt plans add recurring pressure to burn.":"No active monthly debt pressure is visible.",impact:s.monthlyPressure>0?"Debt payments directly affect burn rate, runway, and safe-to-spend.":"No recurring debt payment is currently reducing runway.",actionLabel:"Open Money Plan",actionRoute:"plan"},{name:"Income concentration",level:i.risk,metric:i.top?`${i.top.pct}%`:"No signal",explanation:i.top?`${i.top.source} is the largest tracked source.`:"Track income sources to detect dependency.",impact:i.top&&i.top.pct>=50?"One source can swing forecast confidence and runway.":"Income sources look less concentrated from current data.",actionLabel:"Open Cash Timeline",actionRoute:"flow"},{name:"Reserve coverage",level:l.target<=0||l.coverage<=0?"High":l.coverage<50?"Medium":"Low",metric:l.target>0?`${l.coverage}%`:"No target",explanation:l.protectedCash>0?"Some money is protected for future obligations.":"No protected reserve cash is visible yet.",impact:l.coverage<50?"Underfunded reserves can make available cash look safer than it is.":"Reserve protection is visible in the current structure.",actionLabel:"Open Money Plan",actionRoute:"plan"},{name:"Expense flexibility",level:a.flexibleTotal<=0&&$>0?"High":a.flexibleTotal<$*.15?"Medium":"Low",metric:j(a.flexibleTotal),explanation:a.flexibleTotal>0?"There is some adjustable monthly spend.":"Most visible burn appears fixed or debt-driven.",impact:a.flexibleTotal>0?"Flexible spend is the fastest burn lever.":"Few visible costs can be reduced quickly.",actionLabel:"Review costs",actionRoute:"plan"},{name:"Cashflow rhythm",level:w<=0&&!D.hasData?"Medium":"Low",metric:w?`${w} checkpoints`:"No checkpoints",explanation:w?"Saved checkpoints can show pattern changes.":"Save checkpoints to unlock trend memory.",impact:w>=3?"Pattern Memory can compare recent operating rhythm.":"Trend memory needs more checkpoints before it can be trusted.",actionLabel:"Open Reality Check",actionRoute:"review"},{name:"Tax exposure",level:z>0&&!l.taxBucket?"High":z>0?"Medium":"Low",metric:z>0?j(z):l.taxBucket?"Tracked":"No target",explanation:l.taxBucket?"A tax or VAT reserve is tracked.":"No explicit tax or VAT reserve is visible.",impact:z>0?"Tax planning estimates can reduce available cash if not protected.":"No visible tax reserve gap from current inputs.",actionLabel:"Review reserves",actionRoute:"plan"}].sort((M,E)=>Zn(E.level)-Zn(M.level))}function po(i,a,s,l,g){const S=i[0]||{name:"Financial clarity",level:"Low"},$=ge("availableCash",Number(t&&t.availableCash)||0),w=Number((o&&o.runwayMonths)??(t&&t.runwayMonths));let D="Stable, keep the cadence";b?G(r&&r.history).length?$<0||S.level==="Critical"?D="Tight, but recoverable":a.top&&a.top.pct>=55?D="Stable with concentration risk":Number.isFinite(w)&&w<4&&(D="Tight, needs attention"):D="Based on live data only":D="Unclear until core inputs exist";const z=i.filter(E=>Zn(E.level)>=1).slice(0,3).map(E=>`${E.name}: ${E.explanation}`);for(;z.length<3;){const E=ls()[z.length]||"Confirm the current cash picture in Reality Check.";z.push(E)}let k="Keep Cash Timeline and Money Plan current";$<0?k="Cover near-term obligations":l.monthlyPressure>s.flexibleTotal&&l.monthlyPressure>0?k="Debt plan + flexible cost reduction":g.coverage<50?k="Protect priority reserves":a.top&&a.top.pct>=55&&(k="Diversify recurring income");let M="Use checkpoints to build pattern memory";return a.top&&a.top.pct>=55?M="Create one additional recurring income source":s.potentialImpact>0?M=`Trim ${j(s.potentialImpact)} of flexible burn`:g.gap>0&&(M="Build a first reserve buffer"),{headline:D,forces:z,mainRisk:S.name,mainLever:k,opportunity:M}}function fo(){const i=G(r&&r.history).slice(0,3),a=3;if(i.length<a)return{history:i,rows:[],required:a,remaining:Math.max(0,a-i.length)};const s=i[0]||{},l=i[1]||{},g=s.summary||{},S=l.summary||{},$=w=>{const D=Number(g[w]),z=Number(S[w]);return Number.isFinite(D)?Number.isFinite(z)?D-z:D:null};return{history:i,required:a,remaining:0,rows:[{label:"Cash rhythm",value:$("netMovement"),copy:"Net movement since the prior checkpoint."},{label:"Income reliability",value:$("incomeReceived"),copy:"Received income compared with the prior checkpoint."},{label:"Burn trend",value:$("expensesPaid"),copy:"Paid expenses compared with the prior checkpoint."},{label:"Reserve discipline",value:$("protectedCash"),copy:"Protected cash change."},{label:"Runway",value:$("runwayNow"),copy:"Runway change in months.",plain:!0}]}}function go({expenseGravity:i,debt:a,reserve:s}){const l=y||{},g=G(l.comparable).find(se=>String(se.id)===String(N))||l.topScenario||null,S=Number(g&&g.adjusted&&g.adjusted.monthlyBurn)||ge("totalMonthlyBurn",Number(t&&t.monthlyBurn)||0),$=Number(g&&g.adjusted&&g.adjusted.safeToSpend)||ge("safeToSpend",Number(t&&t.safeToSpend)||0),w=g&&g.adjusted?g.adjusted.runway:null,D=g&&g.delta?Math.abs(Math.min(0,Number(g.delta.reserveGap)||0)):0,z=s.gap>0&&D>0?Math.ceil(s.gap/D):null,k=g&&g.delta?Math.abs(Math.min(0,Number(g.delta.debtPressure)||0)):0,M=Math.max(0,a.monthlyPressure-k),E=a.totalDebt>0&&M>0?za(Math.ceil(a.totalDebt/M)):"",ce=$<0?"Still tight":w!=null&&w<3?"Improving but thin":"More stable";return{adjustedBurn:S,adjustedSurplus:$,adjustedRunway:w,monthsToTarget:z,debtFreeDate:E,health:ce}}function vo({risks:i,dependency:a,debt:s,reserve:l,scenario:g}){const S=[];return(ge("availableCash",Number(t&&t.availableCash)||0)<0||i.some(w=>w.name==="Liquidity risk"&&Zn(w.level)>=2))&&S.push({title:"Stabilize the next 30 days",why:"Available cash is under near-term pressure.",effect:"Reduces immediate liquidity risk.",label:"Open Money Plan",action:"FinancialMode.setSection",args:"'plan'"}),s.monthlyPressure>0&&Zn((i.find(w=>w.name==="Debt pressure")||{}).level)>=1&&S.push({title:"Review debt pressure",why:"Debt plans are part of monthly burn.",effect:`Pressure visible: ${j(s.monthlyPressure)} / month.`,label:"Open debt planner",action:"FinancialMode.setSection",args:"'plan'"}),(l.protectedCash<=0||l.coverage<50)&&S.push({title:"Build a €500 micro-buffer",why:"A small protected buffer makes delayed invoices less disruptive.",effect:"Improves reserve discipline.",label:"Add reserve bucket",action:"FinancialMode.openAddModal",args:"'reserveBucket'"}),a.top&&a.top.pct>=55&&S.push({title:"Diversify income over 90 days",why:`${a.top.source} carries ${a.top.pct}% of tracked income.`,effect:"Lowers concentration risk.",label:"Open Cash Timeline",action:"FinancialMode.setSection",args:"'flow'"}),G(r&&r.history).length||S.push({title:"Save your first checkpoint",why:"Pattern detection starts after a saved checkpoint.",effect:"Unlocks cash rhythm and trend memory.",label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"}),S.length||S.push({title:"Keep the operating loop current",why:"The current diagnosis has no urgent imbalance.",effect:g.health,label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"}),S.slice(0,5)}function ho(i,a,s,l={}){return`
            <div class="fin-insights-metric-row">
                <span>${v(i)}</span>
                <strong>${l.plain?v(String(a??"—")):j(a)}</strong>
                <small>${v(s||"")}</small>
            </div>
        `}function qa(i){const a=String(i||"info").toLowerCase();return a==="critical"||a==="high"?"is-critical":a==="warning"||a==="medium"?"is-warning":a==="opportunity"?"is-opportunity":"is-info"}function gi(i,a,s=""){const l=$e(a||"decisions");return pe({label:i||"Review",action:"FinancialMode.setSection",args:`'${l}'`,variant:s.includes("primary")?"primary":"secondary",size:"sm"})}function bo(i){const a=String(i&&i.severity||"").toLowerCase(),s=String(i&&i.source||"").toLowerCase(),l=String(i&&i.affectedMetric||"").toLowerCase();return a==="critical"||a==="high"?"warning":a==="opportunity"||s==="flow"?"money-in":/protected|reserve|tax/.test(l)?"shield":/runway|safe/.test(l)?"trend-down":/review/.test(s)?"review":"attention"}function yo(i){const a=Br(i&&(i.urgency||i.severity)||"info");return`${i&&i.source?i.source:"System"} signal · ${a}`}function wo(i,a=0){const s=qa(i&&i.severity),l=a===0;return`
            <div class="fin-decision-card ${s}" data-decision-card="${v(i&&i.id||`decision-${a}`)}">
                <div class="fin-decision-card-head">
                    <div class="fin-decision-signal">
                        <span class="fin-decision-signal-icon">${Fe(bo(i),{size:"sm",tone:s==="is-opportunity"?"success":s==="is-warning"?"warning":s==="is-critical"?"danger":"muted"})}</span>
                        <span>${v(yo(i))}</span>
                    </div>
                    <span class="fin-status-pill">${v(i&&i.affectedMetric||"Metric")}</span>
                </div>
                <div class="fin-decision-card-main">
                    <strong>${v(i&&i.title||"Decision")}</strong>
                    <p>${v(i&&i.explanation||"")}</p>
                </div>
                <div class="fin-decision-meaning">
                    <span>Meaning</span>
                    <strong>${v(i&&i.why||i&&i.trigger||"Review this signal before changing the plan.")}</strong>
                </div>
                <div class="fin-decision-evidence">
                    <span>${v(i&&i.sourceData||"Current local data")}</span>
                    <span>${v(i&&i.metricImpact||"Needs review")}</span>
                    ${i&&i.optionalScenario?"<span>Scenario-ready</span>":""}
                </div>
                <div class="fin-decision-card-actions">
                    ${gi(i&&i.actionLabel,i&&i.actionRoute,l?"fin-mini-btn--primary":"")}
                </div>
            </div>
        `}function So(i,a){return`
            <div class="fin-decision-focus-item" data-decision-focus="${v(i&&i.id||`focus-${a}`)}">
                <span>${a+1}</span>
                <div>
                    <strong>${v(i&&i.title||"Review this week")}</strong>
                    <p>${v(i&&i.reason||"")}</p>
                </div>
                ${gi(i&&i.actionLabel,i&&i.actionRoute)}
            </div>
        `}function Ji(i,a){const s=G(h&&h[i]).slice(0,5);return`
            <div class="fin-decision-timeline-column" data-decision-timeline="${v(i)}">
                <div class="fin-decision-timeline-head">
                    <strong>${v(a)}</strong>
                    <span class="fin-status-pill">${s.length}</span>
                </div>
                ${s.length?s.map(l=>`
                    ${qt({title:l.label||"Pressure",meta:`${l.kind||"Item"} · ${ke(l.date)}`,amount:j(Math.abs(Number(l.amount)||0)),amountClass:Number(l.amount)>=0&&String(l.kind||"").toLowerCase().includes("income")?"fin-val-pos":"",iconHtml:Fe(Number(l.amount)>=0?"money-in":"calendar",{size:"sm",tone:Number(l.amount)>=0?"success":"muted"}),extraClass:"fin-decision-timeline-item fin-board-list-row",attrs:`data-timeline-source="${v(l.sourceId||l.id||"")}"`})}
                `).join(""):Me("No dated pressure in this window.")}
            </div>
        `}function $o(i,a=0){return qt({title:i&&i.title||"Revenue opportunity",meta:`${i&&i.sourceData||"Cash Timeline opportunity"} · ${i&&i.metricImpact||"Runway impact"}${i&&i.optionalScenario?" · scenario-ready":""}`,iconHtml:Fe("money-in",{size:"sm",tone:"success"}),actionHtml:gi(i&&i.actionLabel||"Open Cash Timeline",i&&i.actionRoute||"flow"),extraClass:"fin-board-list-row fin-decision-opportunity-row",attrs:`data-decision-opportunity="${v(i&&i.id||`opportunity-${a}`)}"`})}function Io(i){return`
            <button class="fin-decision-shortcut" type="button" data-action="FinancialMode.setSection" data-action-args="'${$e(i&&i.route||"radar")}'" data-decision-shortcut="${v(i&&i.id||"")}">
                <strong>${v(i&&i.label||"Run scenario")}</strong>
                <span>Display-only shortcut</span>
            </button>
        `}function Ao(){const i=y&&y.topScenario,a=Math.max(100,Math.round(Number(i&&i.amount)||Number(t&&t.monthlyBurn)||500));return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-decision-scenario-draft" data-decision-scenario-draft>
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Create Decision</div>
                            <div class="fin-helper-text">Save a planning draft, then inspect its impact below. Drafts do not mutate cash, obligations, income, or the ledger.</div>
                        </div>
                    </div>
                    <div class="fin-settings-form">
                        <div class="form-group">
                            <label for="decision-scenario-name">Decision name</label>
                            <input id="decision-scenario-name" placeholder="Example: Reduce software spend" />
                        </div>
                        <div class="form-group">
                            <label for="decision-scenario-type">Decision type</label>
                            <select id="decision-scenario-type">
                                ${J.map(([s,l])=>`<option value="${v(s)}">${v(l)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="decision-scenario-amount">Amount</label>
                            <input id="decision-scenario-amount" type="number" min="0" step="50" value="${v(a)}" />
                        </div>
                        <div class="form-group">
                            <label for="decision-scenario-protect">Protection %</label>
                            <input id="decision-scenario-protect" type="number" min="0" max="100" step="5" placeholder="Optional" />
                        </div>
                    </div>
                    <div class="fin-action-row">
                        ${pe({label:"Save decision draft",action:"save-decision-scenario-draft",local:!0,variant:"primary"})}
                    </div>
                </div>
            </section>
        `}function Mo(){const i=f||pr({readModel:e||{},snapshot:t||{},treasury:o||{},forecast:u||{},roadmapMetrics:m||{},reviewState:r||{},settings:window.Store.getUiSettings()||{},nowIso:new Date().toISOString()}),a=i.status||{},s=G(i.weeklyFocus).slice(0,3),l=G(i.decisionCards).slice(0,6),g=G(i.opportunities).slice(0,4),S=G(i.scenarioShortcuts),$=ge("safeToSpend",Number(t&&t.safeToSpend)||0),w=o?.runwayMonths!=null?o.runwayMonths:t?.runwayMonths,D=dn("reviewQueue").length;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-hero ${qa(a.severity)}">
                    <div class="fin-decisions-hero-copy">
                        <span class="fin-eyebrow">Decision cockpit</span>
                        <strong>${v(a.label||"Stable")}</strong>
                        <p>${v(a.explanation||"No major decision pressure is visible.")}</p>
                        ${mn("decisionLab","Decision Lab")}
                    </div>
                    <div class="fin-decisions-status">
                        <div>
                            <span>Primary signal</span>
                            <strong>${v(a.primaryMetric||"Current local data")}</strong>
                        </div>
                        <div>
                            <span>Safe-to-Spend</span>
                            <strong>${j($)}</strong>
                        </div>
                        <div>
                            <span>Runway</span>
                            <strong>${w==null?"Unknown":`${Number(w).toFixed(1)} months`}</strong>
                        </div>
                        <div>
                            <span>Review queue</span>
                            <strong>${D}</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-decisions-grid">
                    <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-focus">
                        <div class="fin-section-heading-row">
                            <div>
                            <div class="widget-title ui-title">Focus Queue</div>
                            <div class="fin-helper-text">The few actions worth attention before adding more detail.</div>
                            </div>
                            <span class="fin-status-pill">${s.length}/3</span>
                        </div>
                        ${s.length?s.map((z,k)=>So(z,k)).join(""):Me("No urgent focus. Keep the weekly review cadence.")}
                    </div>
                </div>
            </section>

            ${Ao()}

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-cards">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Decision Cards</div>
                            <div class="fin-helper-text">Signals grouped as actions, risks, and opportunities. Open the source board only when you need to act.</div>
                        </div>
                        ${gi("Open Risk Radar","radar")}
                    </div>
                    <div class="fin-decision-card-grid">
                        ${l.length?l.map((z,k)=>wo(z,k)).join(""):Me("No decision cards for the current local data.")}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-timeline">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Pressure Timeline</div>
                            <div class="fin-helper-text">Upcoming costs, debt starts, expected income, and pressure signals grouped by horizon.</div>
                        </div>
                        ${gi("Open Cash Timeline","flow")}
                    </div>
                    <div class="fin-decision-timeline-grid">
                        ${Ji("7d","Next 7 days")}
                        ${Ji("30d","Next 30 days")}
                        ${Ji("90d","Next 90 days")}
                    </div>
                </div>
            </section>

            ${Va()}

            <section class="fin-section">
                <div class="fin-decisions-grid">
                    <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-shortcuts">
                        <div class="widget-title ui-title">Scenario Shortcuts</div>
                        <div class="fin-helper-text">Quick jumps to the source boards behind each preview. They navigate; they do not change local data.</div>
                        <div class="fin-decision-shortcut-grid">
                            ${S.map(Io).join("")}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame fin-decisions-opportunities">
                        <div class="widget-title ui-title">Opportunity Signals</div>
                        <div class="fin-helper-text">Revenue opportunities ranked by runway and safety impact.</div>
                        <div class="fin-decision-opportunity-list">
                            ${g.length?g.map((z,k)=>$o(z,k)).join(""):Me("Add dated opportunities in Cash Timeline to see runway impact.")}
                        </div>
                    </div>
                </div>
            </section>
        `}function Xi(i){return String(i||"scenario").replace(/_/g," ")}function No(i,a={}){if(i==null)return"—";const s=Number(i)||0,l=s>0?"+":"";return a.months?`${l}${s.toFixed(1)} mo`:`${l}${j(s)}`}function Jn(i,a,s,l,g={}){return`
            <div class="fin-scenario-metric">
                <span>${v(i)}</span>
                <strong>${g.months?s==null?"—":`${Number(s).toFixed(1)} mo`:j(s)}</strong>
                <small class="${Number(l)>0?"fin-val-pos":Number(l)<0?"fin-val-neg":""}">Base ${g.months?a==null?"—":`${Number(a).toFixed(1)} mo`:j(a)} · ${No(l,g)}</small>
            </div>
        `}function Va(){const i=y||fr({readModel:e||{},snapshot:t||{},treasury:o||{},forecast:u||{},decisionEngine:f||{},savedScenarios:window.Store.getSavedScenarios().scenarios||[],nowIso:new Date().toISOString()}),a=G(i.comparable),s=a.find(g=>String(g.id)===String(N))||a[0]||null,l=new Set(G(i.saved).map(g=>String(g.id)));return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-scenario-lab-v2" data-scenario-lab="v2">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Scenario Lab 2.0</div>
                            <div class="fin-helper-text">Deterministic previews from current treasury, forecast, debt, reserve, and decision-engine data.</div>
                        </div>
                        <div class="fin-action-row">
                            ${pe({label:"Save preview",action:"save-scenario-preview",local:!0,variant:"primary",attrs:s?"":"disabled"})}
                        </div>
                    </div>
                    <div class="fin-scenario-lab-grid">
                        <div class="fin-board-panel fin-scenario-picker">
                            <span class="fin-eyebrow">Scenario types</span>
                            ${a.slice(0,8).map(g=>`
                                <button class="fin-scenario-choice ${String(s&&s.id)===String(g.id)?"active":""}" type="button" data-fin-action="set-scenario-preview" data-fin-scenario-id="${v(g.id)}" data-scenario-choice="${v(g.type)}">
                                    <span><strong>${v(g.name)}</strong><small>${v(Xi(g.type))} · impact ${v(String(Math.round(g.impactScore)))}</small></span>
                                    <strong>${j(g.amount)}</strong>
                                </button>
                            `).join("")}
                        </div>
                        <div class="fin-board-panel fin-scenario-preview" data-scenario-preview="${v(s&&s.id||"")}">
                            <span class="fin-eyebrow">Preview impact</span>
                            <strong>${v(s?s.name:"No scenario")}</strong>
                            ${s?`
                                <div class="fin-scenario-metric-grid">
                                    ${Jn("Safe-to-Spend",s.base.safeToSpend,s.adjusted.safeToSpend,s.delta.safeToSpend)}
                                    ${Jn("Available cash",s.base.availableCash,s.adjusted.availableCash,s.delta.availableCash)}
                                    ${Jn("Monthly burn",s.base.monthlyBurn,s.adjusted.monthlyBurn,s.delta.monthlyBurn)}
                                    ${Jn("Runway",s.base.runway,s.adjusted.runway,s.delta.runway,{months:!0})}
                                    ${Jn("Debt pressure",s.base.debtPressure,s.adjusted.debtPressure,s.delta.debtPressure)}
                                    ${Jn("Reserve gap",s.base.reserveGap,s.adjusted.reserveGap,s.delta.reserveGap)}
                                </div>
                                ${G(s.warnings).length?`<div class="fin-forecast-warning-list">${s.warnings.map(g=>`<div class="fin-confidence-row"><span class="fin-text-med">${v(g)}</span></div>`).join("")}</div>`:""}
                            `:Me("Choose a scenario to preview impact.")}
                        </div>
                    </div>
                    <div class="fin-board-panel fin-scenario-saved" aria-label="Saved scenarios">
                        <div class="fin-section-heading-row">
                            <div>
                                <span class="fin-eyebrow">Saved scenarios</span>
                                <div class="fin-helper-text">Planning drafts only. They do not change the ledger or read model.</div>
                            </div>
                            <span class="fin-status-pill">${G(i.saved).length}</span>
                        </div>
                        ${G(i.saved).length?G(i.saved).map(g=>`
                            ${qt({title:g.name,meta:`${Xi(g.type)} · ${j(g.amount)}`,actionHtml:`
                                    ${pe({label:"Preview",action:"set-scenario-preview",local:!0,size:"sm",attrs:`data-fin-scenario-id="${v(g.id)}"`})}
                                    ${pe({label:"Delete",action:"delete-saved-scenario",local:!0,size:"sm",variant:"danger",attrs:`data-fin-scenario-id="${v(g.id)}"`})}
                                `,iconHtml:Fe("review",{size:"sm",tone:"muted"}),extraClass:"fin-board-list-row",attrs:`data-saved-scenario="${v(g.id)}"`})}
                        `).join(""):Me(l.size?"Saved scenarios are being prepared.":"Save a preview to compare it later.")}
                    </div>
                </div>
            </section>
        `}function Do(){const i=so(),a=co(),s=lo(a),l=uo(),g=mo({dependency:i,expenseGravity:a,debt:s,reserve:l}),S=po(g,i,a,s,l),$=fo(),w=go({expenseGravity:a,debt:s,reserve:l}),D=vo({risks:g,dependency:i,debt:s,reserve:l,scenario:w}),z=Math.max(1,a.essentialTotal,a.flexibleTotal,s.monthlyPressure,a.taxReserveGap);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-insights-hero">
                    <div class="fin-insights-hero-main">
                        <span class="fin-eyebrow">Risk Radar status</span>
                        <strong>${v(S.mainRisk)}</strong>
                        <span class="fin-insights-hero-state">${v(S.headline)}</span>
                        <p>${v(g[0]&&g[0].explanation||"Your local finance picture is ready for review.")}</p>
                    </div>
                    <div class="fin-insights-forces">
                        <span class="fin-eyebrow">Why this is showing</span>
                        ${S.forces.map(k=>`<div class="fin-insights-force">${v(k)}</div>`).join("")}
                    </div>
                    <div class="fin-insights-hero-summary">
                        <div>${Fe("warning",{size:"sm",tone:Zn((g[0]||{}).level)>=2?"danger":"muted"})}<span>Main risk</span><strong>${v(S.mainRisk)}</strong></div>
                        <div>${Fe("review",{size:"sm",tone:"muted"})}<span>Main lever</span><strong>${v(S.mainLever)}</strong></div>
                        <div>${Fe("money-in",{size:"sm",tone:"success"})}<span>Main opportunity</span><strong>${v(S.opportunity)}</strong></div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid fin-insights-grid--radar">
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-radar">
                        <div class="widget-title ui-title">Risk Radar</div>
                        <div class="fin-helper-text">Ranked risks from the current local data. Each row explains the why, not just the label.</div>
                        <div class="fin-insights-risk-list">
                            ${g.map(k=>`
                                <div class="fin-insights-risk-row">
                                    <div>
                                        <strong>${v(k.name)}</strong>
                                        <span>${v(k.explanation)}</span>
                                        <small>${v(k.impact||"")}</small>
                                    </div>
                                    <div>
                                        ${ao(k.level)}
                                        <small>${v(k.metric)}</small>
                                        ${pe({label:k.actionLabel||"Review",action:"FinancialMode.setSection",args:`'${$e(k.actionRoute||"radar")}'`,size:"sm"})}
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-memory">
                        <div class="widget-title ui-title">Pattern Memory</div>
                        ${$.history.length>=($.required||3)?`
                            <div class="fin-helper-text">What changed across recent saved checkpoints.</div>
                            <div class="fin-insights-memory-list">
                                ${$.rows.map(k=>ho(k.label,k.value,k.copy,{plain:k.plain})).join("")}
                            </div>
                        `:`
                            <div class="fin-insights-empty-state fin-insights-memory-locked" data-pattern-memory="locked">
                                <strong>Save ${$.required||3} checkpoints to unlock trend memory.</strong>
                                <span>${$.history.length?`${$.history.length} saved · ${$.remaining} to go.`:"No checkpoints saved yet."} Pattern Memory stays compact until there is enough history to compare.</span>
                                <div class="fin-insights-memory-progress" aria-label="Pattern Memory checkpoint progress">
                                    <span style="width:${Math.min(100,$.history.length/($.required||3)*100)}%"></span>
                                </div>
                                ${pe({label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"})}
                            </div>
                        `}
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid">
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-panel">
                        <div class="widget-title ui-title">Income Dependency</div>
                        <div class="fin-helper-text">${v(i.interpretation)} Healthy target: no single client above 40–50% of recurring income.</div>
                        ${i.rows.length?`
                            <div class="fin-insights-source-list">
                                ${i.rows.map(k=>`
                                    <div class="fin-insights-source-row">
                                        <div><strong>${v(k.source)}</strong><span>${v(en(k.count,"item"))}${k.kinds?` · ${v(k.kinds)}`:""}</span></div>
                                        <div class="fin-insights-bar"><span style="width:${k.pct}%"></span></div>
                                        <strong>${k.pct}%</strong>
                                    </div>
                                `).join("")}
                            </div>
                            <div class="fin-insights-recommendation">Suggested move: create one additional recurring income stream or convert another client into a retainer.</div>
                        `:Me("Add expected or settled income to reveal dependency risk.")}
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-panel">
                        <div class="widget-title ui-title">Expense Gravity</div>
                        <div class="fin-helper-text">${v(a.interpretation)}</div>
                        <div class="fin-insights-gravity-list">
                            ${[["Non-negotiable gravity",a.essentialTotal],["Adjustable gravity",a.flexibleTotal],["Debt/payment pressure",s.monthlyPressure],["Reserve/tax obligations",a.taxReserveGap]].map(([k,M])=>`
                                <div class="fin-insights-gravity-row">
                                    <div><span>${v(k)}</span><strong>${j(M)}</strong></div>
                                    <div class="fin-insights-bar"><span style="width:${ee(M,z)}%"></span></div>
                                </div>
                            `).join("")}
                        </div>
                        <div class="fin-insights-recommendation">Most realistic lever: ${a.potentialImpact>0?`${j(a.potentialImpact)} flexible burn reduction`:"confirm debt plans and recurring costs first"}.</div>
                    </div>
                </div>
            </section>

            <section class="fin-section">
                <div class="fin-insights-grid">
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-panel fin-insights-debt">
                        <div class="widget-title ui-title">Debt Intelligence</div>
                        <div class="fin-helper-text">${v(s.interpretation)}</div>
                        <div class="fin-insights-stat-grid">
                            <div><span>Total debt</span><strong>${j(s.totalDebt)}</strong></div>
                            <div><span>Monthly minimum pressure</span><strong>${j(s.monthlyPressure)}</strong></div>
                            <div><span>Liabilities</span><strong>${s.debts.length}</strong></div>
                            <div><span>Largest debt</span><strong>${v(s.largest&&s.largest.name||"None")}</strong></div>
                        </div>
                        ${s.largest?`<div class="fin-insights-recommendation">Projected payoff: ${s.payoffDate?ke(s.payoffDate):"Add a payment plan to estimate this."}</div>`:""}
                    </div>
                    <div class="widget ui-card glass fin-card fin-board-frame fin-insights-panel">
                        <div class="widget-title ui-title">Reserve Discipline</div>
                        <div class="fin-helper-text">${v(l.recommendation)}</div>
                        <div class="fin-insights-stat-grid">
                            <div><span>Protected money</span><strong>${j(l.protectedCash)}</strong></div>
                            <div><span>Reserve target</span><strong>${j(l.target)}</strong></div>
                            <div><span>Coverage</span><strong>${l.target>0?`${l.coverage}%`:"No target"}</strong></div>
                            <div><span>Emergency buffer</span><strong>${l.emergencyBucket?"Tracked":"Missing"}</strong></div>
                        </div>
                        <div class="fin-insights-meter"><span style="width:${Math.min(100,l.coverage)}%"></span></div>
                        <div class="fin-insights-recommendation">Tax reserve: ${l.taxBucket?"tracked":"not visible yet"}.</div>
                    </div>
                </div>
            </section>

            ${Va()}

            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-insights-moves">
                    <div class="widget-title ui-title">Recommended Moves</div>
                    <div class="fin-helper-text">Prioritized actions that improve the diagnosis fastest.</div>
                    <div class="fin-insights-move-list">
                        ${D.map((k,M)=>`
                            <div class="fin-insights-move-row">
                                <div class="fin-insights-move-index">${M+1}</div>
                                <div>
                                    <strong>${v(k.title)}</strong>
                                    <span>${v(k.why)}</span>
                                    <small>${v(k.effect)}</small>
                                </div>
                                ${pe({label:k.label,action:k.action,args:k.args||"",size:"sm"})}
                            </div>
                        `).join("")}
                    </div>
                </div>
            </section>
        `}function Co(){const i=dn("reviewQueue").length,a=Xn();return`
            <section class="fin-section fin-section--toolbar">
                <div class="fin-ui-toolbar">
                    <div class="fin-operating-meta">
                        <span>Last updated: ${ke(n.latestEventTimestamp)||"Never"}</span>
                        <span>Needs confirmation: ${i}</span>
                        ${a?'<span class="fin-text-high">Reality check suggested</span>':""}
                        <span>Data: Local only</span>
                    </div>
                    <div class="fin-toolbar-actions">
                        <select id="fin-scope-filter" class="fin-scope-filter" aria-label="Treasury scope">${mr(window.Store.getUiSettings().scopeFilter||"all")}</select>
                    </div>
                </div>
            </section>
        `}function ea(){const i=Number(u&&u.byHorizon&&u.byHorizon[30]&&u.byHorizon[30].expected);if(Number.isFinite(i))return i;const a=o?.incomeScenarios||{},s=Number(a.expected);if(Number.isFinite(s))return s;const l=Number(t?.projectedBalance);return Number.isFinite(l)?l:ge("availableCash",0)}function xo(){return o?.runwayMonths!=null?o.runwayMonths:t?.runwayMonths}function ko(i){const a=String(i&&i.type||""),s=$e(i&&i.id||"");return String(i&&i.id)==="month-end-gap"?{label:"Adjust reserves",action:"FinancialMode.setSection",args:"'plan'"}:String(i&&i.id)==="monthly-review"?{label:"Save checkpoint",action:"FinancialMode.setSection",args:"'review'"}:a==="Overdue"?{label:"Review income",action:"FinancialMode.setSection",args:"'flow'"}:a==="Due soon"?{label:"Review obligation",action:"FinancialMode.setSection",args:"'review'"}:a==="Missing forecast input"?{label:"Add income",action:"FinancialMode.openAddModal",args:"'income'"}:a==="Missing plan"&&/reserve/i.test(String(i&&i.title||""))?{label:"Add reserve",action:"FinancialMode.openAddModal",args:"'reserveBucket'"}:a==="Missing plan"?{label:"Confirm plan",action:"openEditModal",args:`'debtPlan', '${s}'`}:a==="Needs review"?{label:"Categorize",action:"FinancialMode.setSection",args:"'review'"}:{label:"Review",action:"FinancialMode.setSection",args:"'review'"}}function Fo(i){const a=String(i&&i.type||"");return String(i&&i.id||"")==="month-end-gap"||a==="Overdue"?"Critical":a==="Due soon"||a==="Missing plan"?"Needs review":"Housekeeping"}function To(i){const a=String(i&&i.type||""),s=String(i&&i.id||"");return s==="month-end-gap"?"Current plan closes short in the next 30 days.":s==="monthly-review"?"Close the monthly loop when you have a minute.":a==="Overdue"?"Expected income or payment is past its date.":a==="Due soon"?"A confirmed obligation needs a decision.":a==="Missing plan"?"Add a plan so burn and runway stay accurate.":a==="Missing forecast input"?"Add expected income to sharpen the forecast.":a==="Needs review"?"Classify this item so totals stay clean.":"Small cleanup that improves the cockpit."}function Eo(){const i=ea(),a=Xn(),s=G(t?.attentionQueue),l=dn("reviewQueue").filter($=>!s.some(w=>String(w&&w.id||"")===String($&&$.id||""))).map($=>({type:$&&$.tone==="urgent"?"Overdue":$&&$.kind==="transaction"?"Needs review":"Missing plan",title:$&&$.title,amount:$&&$.amount,action:$&&$.actionLabel,id:$&&($.targetId||$.id),original:$})),g=[...i<0?[{type:"Critical",title:"Projected month-end gap",amount:-Math.abs(i),action:"Adjust reserves",id:"month-end-gap"}]:[],...a?[{type:"Needs review",title:"Checkpoint",amount:null,action:"Save checkpoint",id:"monthly-review"}]:[],...s,...l].map($=>{const w=Fo($),D=ko($);return{id:String($&&$.id||$&&$.title||w),group:w,title:String($&&$.title||"Review item"),amount:$&&$.amount,reason:To($),button:D}}),S={Critical:0,"Needs review":1,Housekeeping:2};return g.sort(($,w)=>(S[$.group]??9)-(S[w.group]??9)).slice(0,5)}function Po(i){const a=Number(i);return Number.isFinite(a)?a<3?{label:"Thin",className:"is-critical"}:a<6?{label:"Watch",className:"is-watch"}:{label:"Stable",className:"is-steady"}:{label:"Unknown",className:"is-watch"}}function Ro(i,a,s){const l=String(i||"").toLowerCase();return Number(a)<0||l==="stormy"?"risky":l==="tight"?"tight":l==="watchful"||Number(a)<Math.max(250,Number(s)||0)?"watchful":"safe"}function Oo(i){return i==="risky"?"is-critical":i==="tight"||i==="watchful"?"is-watch":"is-steady"}function _o(){return yt().filter(a=>{const s=fi(a);return s!=="lead"&&s!=="proposal"&&s!=="risky"}).sort((a,s)=>(Date.parse(String(a&&a.expectedDateISO||""))||Number.MAX_SAFE_INTEGER)-(Date.parse(String(s&&s.expectedDateISO||""))||Number.MAX_SAFE_INTEGER))[0]||null}function jo(i=5){return dn("obligations").filter(a=>String(a&&a.status||"")!=="paid").sort((a,s)=>(Date.parse(String(a&&a.dueDate||""))||Number.MAX_SAFE_INTEGER)-(Date.parse(String(s&&s.dueDate||""))||Number.MAX_SAFE_INTEGER)).slice(0,i)}function Bo(i){const a=Si({title:"Next Money In",subtitle:"The closest incoming money with enough reliability to track.",actions:mn("nextMoneyIn","Next Money In")});if(!i)return`
                <div class="fin-pulse-mini-card fin-widget">
                    ${a}
                    <div class="fin-widget-body">
                    ${Me("Add confirmed or expected income in Cash Timeline.")}
                    </div>
                    ${ii(pe({label:"Add income",action:"FinancialMode.openAddModal",args:"'income'",variant:"primary"}))}
                </div>
            `;const s=fi(i),l=Number.isFinite(Number(i.probability))?Math.round(Number(i.probability)*100):0;return`
            <div class="fin-pulse-mini-card fin-widget">
                ${a}
                <div class="fin-widget-body fin-widget-body--list">
                    ${qt({title:i.title||"Expected income",meta:[ke(i.expectedDateISO),Fi(i),s,`${l}% reliable`].filter(Boolean).join(" · "),amount:j(Number(i.value)||0),amountClass:"fin-val-pos",iconHtml:Fe("money-in",{size:"sm",tone:"success"})})}
                    <p class="fin-widget-interpretation">Expected income supports the forecast, but does not count as actual cash until received.</p>
                </div>
                ${ii(pe({label:"Open Cash Timeline",action:"FinancialMode.setSection",args:"'flow'"}))}
            </div>
        `}function Lo(i){return`
            <div class="fin-pulse-mini-card fin-widget">
                ${Si({title:"Next Obligations",subtitle:"Upcoming costs already spoken for.",actions:mn("nextObligations","Next Obligations")})}
                <div class="fin-widget-body fin-widget-body--list">
                ${i.length?`
                    <div class="fin-pulse-obligation-list">
                        ${i.map(s=>`
                            ${qt({title:s.title||"Obligation",meta:`${ke(s.dueDate)} · ${s.type==="debt"?"Debt payment plan":"Recurring obligation"}`,amount:j(s.amount),iconHtml:Fe(s.type==="debt"?"debt":"calendar",{size:"sm",tone:"muted"}),extraClass:"obligation-row"})}
                        `).join("")}
                    </div>
                `:Me("Add fixed costs or debt payment plans in Money Plan.")}
                </div>
                ${ii(pe({label:"Open Money Plan",action:"FinancialMode.setSection",args:"'plan'"}))}
            </div>
        `}function Uo(){const i=G(e&&e.fiatAccounts),a=G(e&&e.recurringExpenses),s=G(o&&o.obligations),l=G(e&&e.pipelineDeals).filter(D=>!["paid","cancelled","lost"].includes(String(D&&D.status||"").toLowerCase())),g=G(e&&e.reserveBuckets),S=ge("protectedCash",ge("reservedCash",0))>0||g.some(D=>(Number(D&&D.currentAmount)||0)>0||(Number(D&&D.targetAmount)||0)>0),$=[{label:"Add cash account",copy:"Start with the real liquid balance.",complete:i.length>0,action:"FinancialMode.openAddModal",args:"'fiatAccount'"},{label:"Add recurring costs",copy:"Normalize the monthly pressure.",complete:a.length>0,action:"FinancialMode.openAddModal",args:"'expense'"},{label:"Add upcoming obligations",copy:"Confirm due dates and payment plans.",complete:s.some(D=>String(D&&D.status||"")!=="paid"),action:"FinancialMode.setSection",args:"'plan'"},{label:"Add expected income",copy:"Keep forecasts separate from cash.",complete:l.length>0,action:"FinancialMode.openAddModal",args:"'income'"},{label:"Add reserve protection",copy:"Protect tax, VAT, health, or buffer cash.",complete:S,action:"FinancialMode.openAddModal",args:"'reserveBucket'"}],w=$.filter(D=>D.complete).length;return b&&w===$.length?"":`
            <div class="fin-minimum-setup" aria-label="Minimum useful setup checklist">
                <div class="fin-minimum-setup-head">
                    <div>
                        <strong>Minimum useful setup</strong>
                        <span>Enough inputs to make Safe-to-Spend, burn, runway, and forecast confidence useful.</span>
                    </div>
                    <small>${w}/${$.length} ready</small>
                </div>
                <div class="fin-minimum-setup-grid">
                    ${$.map(D=>`
                        <button type="button" class="fin-minimum-setup-step${D.complete?" is-complete":""}" data-action="${v(D.action)}" data-action-args="${v(D.args)}">
                            <span>${D.complete?"Ready":"Needed"}</span>
                            <strong>${v(D.label)}</strong>
                            <small>${v(D.copy)}</small>
                        </button>
                    `).join("")}
                </div>
            </div>
        `}function zo(){const i=window.Store&&typeof window.Store.getSampleDataStatus=="function"?window.Store.getSampleDataStatus():null;return!i||!i.isSampleData?"":`
            <div class="fin-sample-data-note" role="note">
                <div>
                    <strong>Fictional sample data</strong>
                    <span>This dashboard is using the local sample ledger. Replace it with your own entries or restore a backup when you are ready.</span>
                </div>
                <div class="fin-sample-data-note-actions">
                    ${pe({label:"Start empty",action:"deleteDemoData",size:"sm",variant:"ghost"})}
                    ${pe({label:"Open Settings",action:"FinancialMode.setSection",args:"'settings'",size:"sm",variant:"ghost"})}
                </div>
            </div>
        `}function qo(){const i=ge("actualCash",ge("totalCash",Number(t?.realBalance)||0)),a=ge("protectedCash",ge("reservedCash",Number(t?.reservedCash)||0)),s=Number(t?.availableCash),l=ge("availableCash",Number.isFinite(s)?s:ge("trulyAvailableCash",i-a)),g=ge("safeToSpend",Number.isFinite(Number(t?.safeToSpend))?Number(t.safeToSpend):l);ge("committedShortTermObligations",Number(t?.committedShortTermObligations)||0),ge("debtPaymentsDueSoon",Number(t?.debtPaymentsDueSoon)||0),ge("minimumBuffer",Number(t?.minimumBuffer)||0);const S=ge("minimumBufferDays",Number(t?.minimumBufferDays)||7),$=ge("totalMonthlyBurn",Number(t?.monthlyBurn)||0),w=xo(),D=w==null?"—":`${Number(w).toFixed(1)}`,z=Po(w),k=m?.financialWeather||{},M=Ro(k.state,g,$),E=Oo(M),ce=w==null?"Add recurring burn and cash accounts to calculate runway.":`Available cash covers ${Number(w).toFixed(1)} months at the current monthly burn.`,se=g<0?`Short by ${j(Math.abs(g))}`:j(g),we=b?`After protected cash, confirmed obligations, debt pressure, and a ${S}-day buffer.`:"Add cash accounts and recurring pressure to reveal what is safe to use.",Ut=Si({title:"Safe-to-Spend",subtitle:"The amount available for the next 30 days after protected cash, obligations, debt plans, and buffer.",actions:`<div class="fin-runway-pill"><span></span>${v(M)}</div>${mn("safeToSpend","Safe-to-Spend")}`}),Je=`
            <div class="fin-subwidget-head">
                <span>Current cash</span>
                ${mn("currentCash","Current cash")}
            </div>
        `,pt=`
            <div class="fin-subwidget-head">
                <span>Runway</span>
                ${mn("runway","Runway")}
            </div>
        `;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-money-picture fin-pulse-hero" data-fin-command-summary>
                    ${Ut}
                    ${zo()}
                    <div class="fin-money-picture-grid">
                        <div class="fin-money-safe ${E}">
                            <span>Safe to spend</span>
                            <strong>${b?se:"—"}</strong>
                            <div class="fin-runway-pill"><span></span>${v(M)}</div>
                            <p>${v(we)}</p>
                        </div>
                        <div class="fin-pulse-secondary">
                            <div class="fin-money-result">
                                ${Je}
                                <strong>${b?j(i):"—"}</strong>
                                <p>${j(a)} protected · ${j(l)} available after near-term pressure.</p>
                            </div>
                            <div class="fin-money-runway ${z.className}">
                                ${pt}
                                <strong>${D}<small> months</small></strong>
                                <div class="fin-runway-pill"><span></span>${v(z.label)}</div>
                                <p>${v(ce)}</p>
                                ${ii(pe({label:"Open Cash Timeline",action:"FinancialMode.setSection",args:"'flow'"}))}
                            </div>
                        </div>
                    </div>
                    ${Uo()}
                </div>
            </section>
        `}function Vo(){const i=ea(),a=Eo(),s=a.find(w=>w.group==="Critical"&&w.id!=="month-end-gap"),l=a.find(w=>w.group==="Needs review"&&/plan/i.test(w.title+w.reason)),g=a.find(w=>/income|reserve/i.test(w.title+w.reason));let S={title:"No urgent decision",body:"The cockpit is steady. A short checkpoint will keep it that way.",buttons:[{label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"}]};i<0?S={title:`Projected month-end gap: ${j(Math.abs(i))}`,body:"Confirm expected income or adjust reserves before reviewing smaller obligations.",buttons:[{label:"Review income",action:"FinancialMode.setSection",args:"'flow'"},{label:"Adjust reserves",action:"FinancialMode.setSection",args:"'plan'"},{label:"Open Cash Timeline",action:"FinancialMode.setSection",args:"'flow'"}]}:s?S={title:s.title,body:s.reason,buttons:[{label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"}]}:l?S={title:l.title,body:"Confirm the payment plan so monthly burn and runway stay accurate.",buttons:[l.button]}:Xn()?S={title:"Reality check is ready",body:"A short checkpoint can keep the cockpit trustworthy. Open it when you want to save a note.",buttons:[{label:"Open Reality Check",action:"FinancialMode.setSection",args:"'review'"}]}:g&&(S={title:g.title,body:g.reason,buttons:[g.button]});const $=S.buttons.map((w,D)=>pe({label:w.label,action:w.action,args:w.args,variant:D===0?"primary":"ghost"})).join("");return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-widget fin-today-decision">
                    ${Si({title:"Suggested Next Move",subtitle:"One useful action, not the whole backlog.",actions:mn("todaysFocus","Suggested Next Move")})}
                    <div class="fin-decision-focus">
                        <div>
                            <strong>${v(S.title)}</strong>
                            <p>${v(S.body)}</p>
                        </div>
                    </div>
                    ${ii($)}
                </div>
            </section>
        `}function Ho(i){const s=String(i&&i.state||"Clear").toLowerCase();return s==="stormy"?{label:"Stormy",className:"is-stormy",icon:"weather-storm"}:s==="tight"?{label:"Rainy",className:"is-rainy",icon:"weather-rain"}:s==="watchful"?{label:"Cloudy",className:"is-cloudy",icon:"weather-cloud"}:s==="stable"?{label:"Stable",className:"is-stable",icon:"weather-clear"}:{label:"Clear",className:"is-clear",icon:"weather-clear"}}function Wo(i){const a=String(i&&i.source||"").toLowerCase(),s=String(i&&i.title||"").toLowerCase(),l=String(i&&i.severity||"").toLowerCase();return l==="critical"||/shortfall|low|drop|gap/.test(s)?"trend-down":/review|classification|matching|decision/.test(s)||a==="review"?"review":/reserve|protected/.test(s)||a==="plan"?"shield":/debt|payment plan/.test(s)?"debt":/cash|income|forecast/.test(s)||a==="flow"?"cash":l==="warning"?"warning":"attention"}function Go(){const i=m?.financialWeather||{state:"Stable",reason:"The current local finance picture is ready for review.",suggestedAction:"Keep the weekly review cadence."},a=G(m?.topSignals).slice(0,2),s=Ho(i);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-widget fin-financial-weather ${s.className}">
                    ${Si({title:"Financial Weather",subtitle:"A data-backed condition, not a mood decoration.",actions:`<span class="fin-weather-status-badge ${s.className}"><span></span>${v(s.label)}</span>${mn("financialWeather","Financial Weather")}`})}
                    <div class="fin-weather-body">
                        <div class="fin-weather-condition">
                            <div class="fin-weather-icon-shell">${Fe(s.icon,{size:"lg",tone:"accent"})}</div>
                            <div>
                                <strong>${v(s.label)}</strong>
                                <span>${v(i.reason||"No major imbalance detected.")}</span>
                            </div>
                            <div class="fin-weather-recommendation">
                                <span>Recommended move</span>
                                <p>${v(i.suggestedAction||"Keep the weekly review cadence.")}</p>
                            </div>
                        </div>
                        <div class="fin-weather-signals">
                            ${a.map(l=>`
                                <div class="fin-weather-signal">
                                    <div class="fin-weather-signal-icon">${Fe(Wo(l),{size:"sm",tone:String(l.severity||"").toLowerCase()==="critical"?"danger":"muted"})}</div>
                                    <div>
                                        <span>${v(l.source||"Risk Radar")} · ${v(l.severity||"info")}</span>
                                        <strong>${v(l.title)}</strong>
                                        <small>${v(l.reason)}</small>
                                    </div>
                                </div>
                            `).join("")||Me("No major signals.")}
                        </div>
                    </div>
                </div>
            </section>
        `}function Ko(){const i=_o(),a=jo(5);return`
            <section class="fin-section">
                <div class="fin-pulse-two-col">
                    ${Bo(i)}
                    ${Lo(a)}
                </div>
            </section>
        `}function Yo(){const i=ge("totalMonthlyBurn",Number(t?.monthlyBurn)||0),a=ea(),s=m?.reserveHealth||{},l=m?.dangerZone||{},g=[{label:"30-day net",value:`${a>=0?"+":""}${j(a)}`,route:"flow",tone:a<0?"fin-val-neg":"fin-text-safe"},{label:"Monthly burn",value:j(i),route:"plan"},{label:"Reserves funded",value:`${Number(s.coveragePercent||0)}%`,route:"plan"},{label:"Forecast low",value:l.lowestAmount==null?"—":j(l.lowestAmount),route:"flow",tone:Number(l.lowestAmount)<0?"fin-val-neg":""}];return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-tiny-trend-strip">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Tiny Trend Strip</div>
                            <div class="fin-helper-text">Small signals only. Open the source board for detail.</div>
                        </div>
                        ${mn("trendStrip","Tiny Trend Strip")}
                    </div>
                    <div class="fin-trend-strip-grid">
                        ${g.slice(0,4).map(S=>`
                            <button class="fin-trend-strip-item" type="button" data-action="FinancialMode.setSection" data-action-args="'${$e(S.route)}'">
                                <span>${v(S.label)}</span>
                                <strong class="${v(S.tone||"")}">${v(S.value)}</strong>
                            </button>
                        `).join("")}
                    </div>
                </div>
            </section>
        `}function Qo(){const i=dn("reviewQueue");return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-review-list-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Review Queue</div>
                            <div class="fin-helper-text">${i.length} unresolved · Only items that need a classification, decision, or check.</div>
                        </div>
                        ${pe({label:"Open Records",action:"FinancialMode.setSection",args:"'logbook'"})}
                    </div>
                    ${i.length?i.map(s=>Qt(s,Zo(s))).join(""):Me("All items reviewed and reconciled.")}
                </div>
            </section>
        `}function Zo(i){const a=String(i&&i.kind||"setup"),s=$e(i&&(i.targetId||i.id)||"");return a==="transaction"?Ve({action:"openEditModal",args:`'transactionReview', '${s}'`,label:"Edit transaction review"}):a==="payment"?Ve({action:"openEditModal",args:`'paymentMatch', '${s}'`,label:"Edit payment match"}):a==="pipeline"?Ve({action:"openEditModal",args:`'pipelineReview', '${s}'`,label:"Edit income review"}):a==="debt"?Ve({action:"openEditModal",args:`'debtPlan', '${s}'`,label:"Edit payment plan"}):a==="obligation"?Ve({action:"openEditModal",args:`'obligationPayment', '${s}'`,label:"Edit obligation review"}):String(i&&i.id)==="missing-cash"?Ve({action:"FinancialMode.openAddModal",args:"'fiatAccount'",label:"Edit cash accounts"}):String(i&&i.id)==="missing-burn"?Ve({action:"FinancialMode.openAddModal",args:"'expense'",label:"Edit recurring costs"}):Ve({action:"FinancialMode.setSection",args:"'review'",label:v(i&&i.actionLabel||"Review item")})}function Jo(){const i=dn("obligations").filter(g=>["overdue","due_soon","needs_review"].includes(String(g&&g.status||""))).slice(0,12),a=i.filter(g=>String(g&&g.status||"")==="overdue"),s=i.filter(g=>String(g&&g.status||"")==="due_soon"),l=i[0]||null;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-review-check-card" data-review-check="obligations">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Obligation Review</div>
                            <div class="fin-helper-text">Compact check only. Resolve individual obligation rows from the Review Queue.</div>
                        </div>
                        ${Ve({action:"FinancialMode.openAddModal",args:"'expense'",label:"Edit recurring costs"})}
                    </div>
                    <div class="fin-review-check-summary">
                        <div><span>Open</span><strong>${i.length}</strong><small>${a.length} overdue · ${s.length} due soon</small></div>
                        <div><span>Next item</span><strong>${v(l&&l.title||"Clear")}</strong><small>${l?`${ke(l.dueDate)} · ${j(l.amount)}`:"No pressing obligations."}</small></div>
                    </div>
                    ${l?pe({label:"Review first obligation",action:"openEditModal",args:`'obligationPayment', '${$e(l.id)}'`,size:"sm"}):Me("No pressing obligations. You are in the clear.")}
                </div>
            </section>
        `}function Xo(){const i=G(e&&e.transactions).filter(g=>String(g&&g.type)==="expense.recorded").slice(0,8),a=i.filter(g=>!g.obligationId),s=i.filter(g=>g.obligationId),l=a[0]||i[0]||null;return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-review-check-card" data-review-check="payments">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Payment Matching</div>
                            <div class="fin-helper-text">Compact check only. Match or categorize individual records from the Review Queue or Records.</div>
                        </div>
                        ${Ve({action:"openEditModal",args:"'transaction'",label:"Edit payments"})}
                    </div>
                    <div class="fin-review-check-summary">
                        <div><span>Needs matching</span><strong>${a.length}</strong><small>${s.length} already linked</small></div>
                        <div><span>Next payment</span><strong>${v(l&&(l.description||"Payment")||"Clear")}</strong><small>${l?`${ke(l.timestamp)} · ${j(l.amount,l.currency)}`:"No payment records waiting."}</small></div>
                    </div>
                    ${l?pe({label:a.length?"Match first payment":"Review payments",action:"openEditModal",args:a.length?`'paymentMatch', '${$e(l.id)}'`:`'transactionReview', '${$e(l.id)}'`,size:"sm"}):Me("Awaiting payments. Book transactions to match them against expectations.")}
                </div>
            </section>
        `}function es(){const i=u||Hi({readModel:e||{},snapshot:t||{},treasury:o||{},nowIso:new Date().toISOString()}),a=[7,30,60,90,180].map(g=>i.byHorizon&&i.byHorizon[String(g)]).filter(Boolean),s=G(i.warnings).slice(0,4),l=ge("availableCash",Number(t?.availableCash)||0);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-flow-scenarios-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Scenario Pressure</div>
                            <div class="fin-helper-text">Conservative, expected, and optimistic cash paths using current obligations, payment plans, reserves, and expected income.</div>
                        </div>
                        ${pe({label:"Edit Money Plan inputs",action:"FinancialMode.setSection",args:"'plan'"})}
                    </div>
                    <div class="fin-status-grid fin-flow-scenario-grid">
                        ${a.map(g=>{const S=Number(g.expected)||0,$=Number(g.conservative)||0,w=Number(g.optimistic)||0,D=S-l,z=$<0?"Shortfall risk":D<0?"Watch":"Clear";return`
                            <div class="fin-status-card fin-flow-scenario-card is-${$<0?"critical":D<0?"watch":"clear"}" data-flow-scenario="${g.days}">
                                <div class="fin-flow-scenario-head">
                                    <span>${g.days} days</span>
                                    <strong>${v(z)}</strong>
                                </div>
                                <strong>${j(S)}</strong>
                                <span>Expected landing · ${D>=0?"+":""}${j(D)} vs available now</span>
                                <small>Range ${j($)} to ${j(w)} · ${j(g.components.expectedIncome)} forecast income</small>
                            </div>
                        `}).join("")}
                    </div>
                    ${s.length?`
                        <div class="fin-forecast-warning-list" aria-label="Forecast warnings">
                            ${s.map(g=>`<div class="fin-confidence-row"><span class="fin-text-med">${v(g)}</span></div>`).join("")}
                        </div>
                    `:""}
                </div>
            </section>
        `}function Xn(){const i=Date.parse(String(r&&r.lastReviewedAt||""));return!Number.isFinite(i)||Date.now()-i>=10080*60*1e3}function ts(i=90){const a=new Date;a.setHours(12,0,0,0);const s=new Date(a);s.setDate(s.getDate()+i);const l=[];G(e&&e.recurringExpenses).forEach(S=>{for(let $=0;$<4;$+=1){const w=new Date(a.getFullYear(),a.getMonth()+$,Math.max(1,Math.min(28,Number(S.dueDay)||1)),12);w<a||w>s||l.push({date:w,label:S.category,amount:-(Number(S.monthlyAmount)||0),kind:"Recurring cost"})}}),G(e&&e.debtAccounts).forEach(S=>{const $=it(S);if(!$)return;const w=new Date(S&&S.dueDate||a);for(let D=0;D<4;D+=1){const z=new Date(a.getFullYear(),a.getMonth()+D,Math.max(1,Math.min(28,Number.isFinite(w.getTime())?w.getDate():1)),12);z<a||z>s||l.push({date:z,label:S.name||"Debt payment",amount:-$,kind:"Debt/payment plan"})}}),yt().forEach(S=>{const $=new Date(S.expectedDateISO||"");!Number.isFinite($.getTime())||$<a||$>s||l.push({date:$,label:S.title,amount:(Number(S.value)||0)*(Number(S.probability)||0),kind:"Expected income"})}),l.sort((S,$)=>S.date-$.date);const g=[30,60,90].map(S=>{const $=new Date(a);$.setDate($.getDate()+S);let w=ge("availableCash",Number(t&&t.availableCash)||Number(t&&t.realBalance)||0),D=w;return l.filter(z=>z.date<=$).forEach(z=>{w+=z.amount,D=Math.min(D,w)}),{horizon:S,low:D,ending:w}});return{events:l,lows:g}}function ns(i){const a=String(i&&i.kind||"").toLowerCase();return Number(i&&i.amount)>=0||a.includes("income")?"money-in":a.includes("debt")?"debt":a.includes("recurring")?"calendar":"warning"}function is(i){return(Number(i&&i.amount)||0)>=0?"income":String(i&&i.kind||"").toLowerCase().includes("debt")?"debt":"outflow"}function as(i,a){const s=Number(i&&i.low);return Number.isFinite(s)?s<0?{label:"Shortfall risk",className:"is-critical",copy:"Forecast dips below zero before this horizon."}:s<Math.max(250,Number(a)*.25)?{label:"Thin buffer",className:"is-watch",copy:"Cash stays positive but the buffer is narrow."}:{label:"Buffer visible",className:"is-clear",copy:"No forecast low-point pressure in this window."}:{label:"Unknown",className:"is-watch",copy:"Add dated inputs to clarify this window."}}function rs(){const i=ts(),a=u?.byHorizon?.["30"]||null,s=m?.financialWeather||{},l=m?.dangerZone||{},g=ge("actualCash",ge("totalCash",Number(t?.realBalance)||0)),S=ge("protectedCash",ge("reservedCash",Number(t?.reservedCash)||0)),$=ge("availableCash",Number(t?.availableCash)||0),w=ge("totalMonthlyBurn",Number(t?.monthlyBurn)||0),D=Number.isFinite(Number(a?.expected))?Number(a.expected):i.lows.find(se=>se.horizon===30)?.ending,z=Number(a?.components?.expectedIncome)||0,k=i.events.find(se=>Number(se.amount)>0),M=i.events.find(se=>Number(se.amount)<0),E=G(h&&h["90d"]).slice(0,9);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-calendar-card fin-flow-timeline-card">
                    <div class="fin-section-heading-row">
                        <div>
                            <div class="widget-title ui-title">Cash Timeline</div>
                            <div class="fin-helper-text">Upcoming income, obligations, payment plans, and low points from the current forecast.</div>
                        </div>
                        <div class="fin-flow-header-pills">
                            <span class="fin-horizon-pill" aria-label="Forecast horizon">${Number(window.Store.getFinanceSettings().forecastDays||90)}d horizon</span>
                            <span class="fin-runway-pill"><span></span>${v(s.state||"Stable")}</span>
                        </div>
                    </div>
                    <div class="fin-flow-hero-grid">
                        <div class="fin-flow-hero-main">
                            <span>Actual vs forecast</span>
                            <div class="fin-flow-cash-band" aria-label="Actual and forecast cash">
                                <div class="fin-flow-cash-card is-actual" data-flow-cash="actual">
                                    <span>Actual cash now</span>
                                    <strong>${j(g)}</strong>
                                    <small>Liquid account balances only</small>
                                </div>
                                <div class="fin-flow-cash-card is-available" data-flow-cash="available">
                                    <span>Available now</span>
                                    <strong>${j($)}</strong>
                                    <small>${j(S)} protected before decisions</small>
                                </div>
                                <div class="fin-flow-cash-card is-forecast" data-flow-cash="forecast">
                                    <span>30-day expected landing</span>
                                    <strong class="${Number(D)<0?"fin-val-neg":""}">${Number.isFinite(Number(D))?j(D):"—"}</strong>
                                    <small>Includes ${j(z)} forecast income, not actual cash</small>
                                </div>
                            </div>
                        </div>
                        <div class="fin-flow-next-pair">
                            <div><span>Next money in</span><strong>${k?j(k.amount):"—"}</strong><small>${k?`${v(k.label)} · ${ke(k.date)}`:"No dated income"}</small></div>
                            <div><span>Next obligation</span><strong>${M?j(Math.abs(M.amount)):"—"}</strong><small>${M?`${v(M.label)} · ${ke(M.date)}`:"No dated outflow"}</small></div>
                            <div><span>Forecast low</span><strong class="${Number(l.lowestAmount)<0?"fin-val-neg":""}">${l.lowestAmount==null?"—":j(l.lowestAmount)}</strong><small>${l.firstNegativeDate?`First shortfall ${ke(l.firstNegativeDate)}`:"No dated shortfall in view"}</small></div>
                        </div>
                    </div>
                    <div class="fin-calendar-lows">
                        ${i.lows.map(se=>{const we=as(se,w);return`<div class="${we.className}" data-flow-low="${se.horizon}">
                                <div class="fin-calendar-low-head">
                                    <span>${se.horizon}d forecast low</span>
                                    <em>${v(we.label)}</em>
                                </div>
                                <strong class="${se.low<0?"fin-val-neg":""}">${j(se.low)}</strong>
                                <small>${v(we.copy)} Ends ${j(se.ending)}.</small>
                            </div>`}).join("")}
                    </div>
                    <div class="fin-calendar-events">
                        ${E.length?E.map(se=>`
                            ${qt({title:se.label,meta:`${se.kind} · ${ke(se.date)}`,amount:`${se.amount>=0?"+":"-"}${j(Math.abs(se.amount))}`,amountClass:se.amount>=0?"fin-val-pos":"fin-val-neg",iconHtml:Fe(ns(se),{size:"sm",tone:se.amount>=0?"success":String(se.kind||"").toLowerCase().includes("debt")?"danger":"muted"}),extraClass:`fin-calendar-event fin-board-list-row is-${is(se)}`,attrs:`data-flow-timeline-item="${v(se.sourceId||se.id||"")}"`})}
                        `).join(""):Me("Add dated income, recurring costs, or payment plans to shape the Cash Timeline.")}
                    </div>
                </div>
            </section>
        `}function os(){const i=window.Store.getUiSettings().scopeFilter||"all",a=typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(i):[];return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-goals-card">
                    <div class="fin-goals-heading">
                        <div>
                            <div class="widget-title ui-title">Savings and Buffer Goals</div>
                            <div class="fin-helper-text">Live progress from linked cash accounts. Keep the targets few and useful.</div>
                        </div>
                        ${pe({label:a.length?"Manage goals":"Add goal",action:"openEditModal",args:`'${a.length?"goals":"goal"}'`})}
                    </div>
                    ${a.length?`
                        <div class="fin-goals-grid">
                            ${a.map(s=>`
                                <div class="fin-goal-item">
                                    <div class="fin-goal-meta">
                                        <span><strong>${v(s.name)}</strong><small>${v(s.type)} · ${v(s.scope)}${s.targetDate?" · by "+ke(s.targetDate):""}</small></span>
                                        <span>${Math.round(s.progressPercent)}%</span>
                                    </div>
                                    <div class="fin-goal-track"><span style="width:${s.progressPercent}%"></span></div>
                                    <div class="fin-goal-values"><span>${j(s.currentAmount)}</span><span>of ${j(s.targetAmount)}</span></div>
                                </div>
                            `).join("")}
                        </div>
                    `:Me("Set a safety buffer to build peace of mind.")}
                </div>
            </section>
        `}function ss(){const i=yt(),a=G(e&&e.invoices).filter(w=>String(w&&w.status||"").toLowerCase()==="paid").sort((w,D)=>new Date(D.paidAt||D.sentAt||0)-new Date(w.paidAt||w.sentAt||0)),s=i.reduce((w,D)=>w+(Number(D.value)||0)*(Number(D.probability)||0),0),l=i.map(w=>({title:w.title||"Pipeline item",weighted:(Number(w.value)||0)*(Number(w.probability)||0)})).sort((w,D)=>D.weighted-w.weighted).slice(0,4),g=jt(),S=Q();let $="";return S==="history"?$=a.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Paid date</th><th>Amount</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${a.map(w=>`
                                <tr>
                                    <td>${w.client||"Invoice"}</td>
                                    <td>${new Date(w.paidAt||w.sentAt||Date.now()).toLocaleDateString()}</td>
                                    <td>${j(w.amount)}</td>
                                    <td style="text-align:right">
                                        ${me({action:"deleteInvoice",args:`'${$e(w.id)}'`,label:`Remove ${w.client||"settled income"} from history`,icon:"warning",tone:"muted"})}
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `:Me("No settled income yet."):S==="cashflow"?$=nt(g):$=`
                ${i.length?`
                    <table class="fin-table fin-table--compact">
                        <thead><tr><th>Source</th><th>Status</th><th>Due state</th><th>Expected date</th><th>Prob.</th><th>Weighted</th><th style="text-align:right">Actions</th></tr></thead>
                        <tbody>
                            ${i.map(w=>{const D=fi(w),z=ki(w,D),k=Number(w.probability||0),M=Zi(w.projectId);return`
                                <tr>
                                    <td>${v(w.title||"Pipeline item")}<small>${v([w.incomeType==="retainer"?"retainer":w.incomeType==="recurring"?"recurring":"",Fi(w),M].filter(Boolean).join(" · "))}</small></td>
                                    <td>${Ft(D)}</td>
                                    <td>${Ft(z)}</td>
                                    <td>${w.expectedDateISO?ke(w.expectedDateISO):"No date"}</td>
                                    <td>${(k*100).toFixed(0)}%</td>
                                    <td class="fin-val-pos">${j((Number(w.value)||0)*k)}</td>
                                    <td style="text-align:right">
                                        <span class="fin-inline-icon-actions fin-inline-icon-actions--right">
                                            ${me({action:"FinancialMode.openAddModal",args:`'income', '${$e(w.id)}'`,label:`Edit ${w.title||"pipeline item"}`})}
                                            ${me({action:"markAsPaid",args:`'${$e(w.id)}'`,label:`Mark ${w.title||"pipeline item"} as received`,icon:"success",tone:"success"})}
                                            ${me({action:"deleteInvoice",args:`'${$e(w.id)}'`,label:`Archive ${w.title||"pipeline item"}`,icon:"warning",tone:"muted"})}
                                        </span>
                                    </td>
                                </tr>
                            `}).join("")}
                        </tbody>
                    </table>
                `:Me(b?"Forecast future income. What is the next likely incoming payment?":"Begin tracking. Add your first entry.")}
                ${i.length&&l.length?`
                    <div class="fin-tab-subsection">
                        <div class="fin-muted fin-subtitle">Dependencies</div>
                        ${l.map(w=>{const D=s>0?Math.round(w.weighted/s*100):0;return`<div class="fin-row-inline"><span>${w.title}</span><span class="fin-muted">${D}%</span></div>`}).join("")}
                    </div>
                `:""}
                ${ii(pe({label:"Add pipeline item",action:"FinancialMode.openAddModal",args:"'income'",variant:"primary"}))}
            `,`
	            <section class="fin-section">
	                <div class="widget ui-card glass fin-card fin-board-frame">
	                    <div class="drag-handle">⋮⋮</div>
	                    <div class="widget-title ui-title">Income Timing</div>
                        <div class="fin-helper-text">Expected money stays forecasted here until it settles into an account.</div>
	                    <div class="fin-tabs" role="tablist" aria-label="Income timing tabs">
	                        <button class="fin-tab-btn ${S==="pipeline"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="pipeline">Expected</button>
	                        <button class="fin-tab-btn ${S==="history"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="history">History</button>
	                        <button class="fin-tab-btn ${S==="cashflow"?"active":""}" type="button" data-fin-action="set-tab" data-fin-tab="cashflow">Rhythm</button>
	                    </div>
                    <div class="fin-tab-panel">
                        ${$}
                    </div>
                </div>
            </section>
        `}function cs(){return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame fin-projection-card">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Runway Projection</div>
                    <div class="fin-helper-text">A 12-month visual forecast. Use Cash Timeline for timing and Money Plan for the structural inputs behind the line.</div>
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
        `}function ls(){const i=[],a=Number(t&&t.runwayMonths),s=Number.isFinite(a),l=G(t&&t.missingInputs),g=Number(t&&t.totalDebt)||0,S=Number(t&&t.realBalance)||0,$=Number(t&&t.confidenceScore);return s?a<2?i.push("Runway is very thin. Consider protecting liquidity and easing optional spend."):a<4?i.push("Runway is thin. It may help to secure one near‑term paid commitment."):i.push("Runway looks steady. Keep it simple."):i.push("Runway becomes clearer once recurring expenses are noted."),g>Math.max(1,S)&&i.push("Debt is high compared to cash on hand. A weekly check-in may help."),l.length>0&&i.push(`Missing: ${l.slice(0,2).join(", ")}.`),Number.isFinite($)&&$<.5&&i.push("Confidence is thin. Add one recent income or expense to sharpen the picture."),i.length===0&&i.push("Nothing pressing right now. Keep reconciling as you go."),i}function ds(){const i=[],s=(typeof window.Store.getGoalProgress=="function"?window.Store.getGoalProgress(window.Store.getUiSettings().scopeFilter||"all"):[]).find(w=>w.type==="buffer");t.runwayMonths==null?i.push("Runway is unknown until monthly burn is noted."):Number(t.runwayMonths)<2?i.push("Runway is under 2 months. Consider easing cash outflow."):Number(t.runwayMonths)<4&&i.push("Runway is under 4 months. It may help to favor steadier income."),Number(t.totalDebt)>Math.max(1,Number(t.realBalance))&&i.push("Debt is higher than cash on hand.");const l=G(t.missingInputs);l.length&&i.push("Missing: "+l.slice(0,3).join(", ")),Xn()&&i.push("Weekly review is due. Reconcile cash accounts and leave a short note."),s&&Number(s.progressPercent)<100&&i.push(`Buffer goal is ${Math.round(Number(s.progressPercent)||0)}% funded.`);const g=i.slice(0,3),S=[];t.runwayMonths!=null&&Number(t.runwayMonths)>=4&&S.push("Runway has some breathing room."),t.monthlyBurn!=null&&S.push("Monthly burn is noted."),l.length||S.push("Core inputs are complete."),Number(t.totalDebt)<=Math.max(1,Number(t.realBalance))&&S.push("Debt is not outweighing cash on hand."),Xn()||S.push("Weekly review is current."),s&&Number(s.progressPercent)>=100&&S.push("Safety buffer is funded.");const $=S.slice(0,3);return`
            <section class="fin-section">
                <div class="widget ui-card glass fin-card fin-board-frame">
                    <div class="drag-handle">⋮⋮</div>
                    <div class="widget-title ui-title">Review Signals</div>
                    <div class="fin-signals-grid">
                        <div class="fin-signal-column fin-signal-column--stable">
                            <div class="fin-signal-title">Stability</div>
                            <div class="fin-signal-list">
                                ${$.length?$.map(w=>`<div class="fin-signal-row">${w}</div>`).join(""):'<div class="fin-compact-empty">No stabilizers yet.</div>'}
                            </div>
                        </div>
                        <div class="fin-signal-column fin-signal-column--tension">
                            <div class="fin-signal-title">Tension</div>
                            <div class="fin-signal-list">
                                ${g.length?g.map(w=>`<div class="fin-signal-row">${w}</div>`).join(""):'<div class="fin-compact-empty">No major tension right now.</div>'}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `}function us(){const i=document.getElementById("fin-projection-svg");if(!i||!window.FinancialEngine||typeof window.FinancialEngine.generateProjections!="function")return;const a=window.FinancialEngine.generateProjections({financeSnapshot:t,financeReadModel:e},{burnChange:0,probFloor:.5,marketShift:0}),s=a.safe||[],l=a.realistic||[],g=a.optimistic||[],S=s.concat(l).concat(g),$=Math.max(1,...S),w=Math.min(0,...S),D=960,z=280,k=24,M=12,E=16,ce=28,se=(D-k-M)/Math.max(1,s.length-1),we=function(Je){const pt=$-w||1;return E+($-Je)/pt*(z-E-ce)},Ut=function(Je){return Je.map((pt,un)=>`${un===0?"M":"L"} ${k+un*se} ${we(pt)}`).join(" ")};i.innerHTML=`
            <rect x="0" y="0" width="${D}" height="${z}" fill="var(--fin-chart-bg)"></rect>
            <line x1="${k}" y1="${we(0)}" x2="${D-M}" y2="${we(0)}" stroke="var(--fin-chart-grid)" stroke-width="1"></line>
            <path d="${Ut(s)}" fill="none" stroke="var(--fin-chart-safe)" stroke-width="2.35"></path>
            <path d="${Ut(l)}" fill="none" stroke="var(--fin-chart-realistic)" stroke-width="2.35"></path>
            <path d="${Ut(g)}" fill="none" stroke="var(--fin-chart-optimistic)" stroke-width="1.9"></path>
        `}function ms(i,a){console.log("[FinancialMode] Opening modal for:",i),window.openEditModal&&(a?window.openEditModal(i,{id:String(a)}):window.openEditModal(i))}function ps(){if(!window.Store)return;const i=document.getElementById("page-settings-currency"),a=document.getElementById("page-settings-forecast"),s=document.getElementById("page-settings-scope"),l=document.getElementById("page-settings-appearance"),g=document.getElementById("page-settings-reduced-motion");if(i&&a&&s&&l&&g)try{window.Store.saveFinanceSettings({baseCurrency:i.value||"EUR",forecastDays:Number(a.value)||90}),window.Store.saveUiSettings({appearance:l.value||"dark-editorial",reducedMotion:g.checked,scopeFilter:s.value||"all"}),window.applyAppearance&&window.applyAppearance(window.Store),window.FinancialMode.render()}catch(S){console.error("Failed to save settings:",S),window.showModalError&&window.showModalError(S.message||"Could not save settings.")}}function fs(i,a){const s=G(e?.recurringExpenses),l=s.find(E=>String(E.id)===String(i));if(!l)return;const g=l.essential,S=s.filter(E=>E.essential===g),$={};try{const E=localStorage.getItem("finance-master.ui.expenseOrder");E&&JSON.parse(E).forEach((se,we)=>$[se]=we)}catch{}S.sort((E,ce)=>{const se=$.hasOwnProperty(E.id)?$[E.id]:99999,we=$.hasOwnProperty(ce.id)?$[ce.id]:99999;return se-we});const w=S.findIndex(E=>String(E.id)===String(i));if(w===-1)return;const D=w+Number(a);if(D<0||D>=S.length)return;const z=S[w];S[w]=S[D],S[D]=z;const k=s.filter(E=>E.essential!==g);k.sort((E,ce)=>{const se=$.hasOwnProperty(E.id)?$[E.id]:99999,we=$.hasOwnProperty(ce.id)?$[ce.id]:99999;return se-we});const M=[...g?S:k,...g?k:S].map(E=>String(E.id));try{localStorage.setItem("finance-master.ui.expenseOrder",JSON.stringify(M))}catch{}ve()}return{init:Bt,render:ve,setSection:U,toggleMobileNav:gn,closeMobileNav:He,setFocusMode:F,setPipelineTab:X,openAddModal:ms,saveSettingsPage:ps,moveExpense:fs}})();window.Store=te;window.FinanceFormatting={formatCurrencyAmount:hs,resolveCurrencyCode:gr};await te.initialize();te.seedDemoIfNeeded();ja(te);window.FinancialMode?.init();window.addEventListener("finance:ui-updated",()=>{ja(te),window.FinancialMode?.render()});
