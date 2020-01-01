var pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad=function(e){var t={};function a(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,a),r.l=!0,r.exports}return a.m=e,a.c=t,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="",a(a.s=0)}([
/*!**********************************!*\
  !*** ./ActivitySummary/index.ts ***!
  \**********************************/
/*! no static exports found */
/*! all exports used */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(){}return e.prototype.init=function(e,t,a,n){e.mode.trackContainerResize(!0),this.mainContainer=document.createElement("div"),this.mainContainer.classList.add("SimpleTable_MainContainer_Style"),this.dataTable=document.createElement("table"),this.dataTable.classList.add("SimpleTable_Table_Style"),this.mainContainer.appendChild(this.dataTable),n.appendChild(this.mainContainer)},e.prototype.updateView=function(e){if(this.contextObj=e,!e.parameters.smartGridDataSet.loading){var t=this.getSortedColumnsOnView(e);if(!t||0===t.length)return;for(var a=this.getColumnWidthDistribution(e,t);this.dataTable.firstChild;)this.dataTable.removeChild(this.dataTable.firstChild);var n=!1;t.forEach((function(e){"activitytypecode"==e.name&&(n=!0)})),n?(this.dataTable.appendChild(this.createTableHeader(t,a)),this.dataTable.appendChild(this.createTableBody(t,a,e.parameters.smartGridDataSet)),this.dataTable.parentElement.style.height=window.innerHeight-this.dataTable.offsetTop-70+"px",this.updateCount(e.parameters.smartGridDataSet)):this.mainContainer.innerHTML="Activity Type Column Missing"}},e.prototype.getOutputs=function(){return{}},e.prototype.destroy=function(){},e.prototype.getSortedColumnsOnView=function(e){if(!e.parameters.smartGridDataSet.columns)return[];var t=e.parameters.smartGridDataSet.columns.filter((function(e){return e.order>=0}));return t.sort((function(e,t){return e.order-t.order})),t},e.prototype.getColumnWidthDistribution=function(e,t){var a=[],n=e.mode.allocatedWidth-250,r=0;t.forEach((function(e){r+=e.visualSizeFactor}));var i=n;return t.forEach((function(e,l){var d="";if(l!==t.length-1){var o=Math.round(e.visualSizeFactor/r*n);i-=o,d=o+"px"}else d=i+"px";a.push(d)})),a},e.prototype.createTableHeader=function(e,t){var a=document.createElement("thead"),n=document.createElement("tr");return n.classList.add("SimpleTable_TableRow_Style"),e.forEach((function(e,a){if("activitytypecode"==e.name){var r=document.createElement("th");r.id="typeHeader",r.classList.add("SimpleTable_TableHeader_Style");var i=document.createElement("div");i.classList.add("SimpleTable_TableCellInnerDiv_Style"),i.style.maxWidth=t[200],i.innerText=e.displayName,r.appendChild(i),n.appendChild(r);var l=document.createElement("th");l.id="countHeader",l.classList.add("SimpleTable_TableHeader_Style");var d=document.createElement("div");d.classList.add("SimpleTable_TableCellInnerDiv_Style"),d.style.maxWidth=t[200],d.innerText="Count",l.appendChild(d),n.appendChild(l)}})),a.appendChild(n),a},e.prototype.createTableBody=function(e,t,a){var n=document.createElement("tbody");if(a.sortedRecordIds.length>0){var r=void 0;r=[""];for(var i=0,l=a.sortedRecordIds;i<l.length;i++){var d=l[i],o=a.records[d].getValue("activitytypecode").toString();if(!r.includes(o)){(m=document.createElement("tr")).classList.add("SimpleTable_TableRow_Style"),r.push(o),m.id=o,(p=document.createElement("td")).classList.add("SimpleTable_TableCell_Style");var c=document.createElement("div");c.classList.add("SimpleTable_TableCellInnerDiv_Style"),c.style.maxWidth=t[200],c.innerText=a.records[d].getFormattedValue("activitytypecode"),p.appendChild(c),m.appendChild(p);var s=document.createElement("td");s.classList.add("SimpleTable_TableCell_Style");var u=document.createElement("div");u.classList.add("SimpleTable_TableCellInnerDiv_Style"),u.style.maxWidth=t[200],u.id="count_"+o,u.innerText="0",s.appendChild(u),m.appendChild(s),n.appendChild(m)}}}else{var p,m=document.createElement("tr");(p=document.createElement("td")).classList.add("No_Record_Style"),p.colSpan=e.length,p.innerText=this.contextObj.resources.getString("PCF_TSTableGrid_No_Record_Found"),m.appendChild(p),n.appendChild(m)}return n},e.prototype.updateCount=function(e){for(var t=0,a=e.sortedRecordIds;t<a.length;t++){var n=a[t],r="count_"+e.records[n].getValue("activitytypecode").toString(),i=document.getElementById(r),l=Number(i.innerText);i.innerText=(l+1).toString()}},e}();t.ActivitySummary=n}]);
if (window.ComponentFramework && window.ComponentFramework.registerControl) {
	ComponentFramework.registerControl('activitySummary.ActivitySummary', pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.ActivitySummary);
} else {
	var activitySummary = activitySummary || {};
	activitySummary.ActivitySummary = pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad.ActivitySummary;
	pcf_tools_652ac3f36e1e4bca82eb3c1dc44e6fad = undefined;
}