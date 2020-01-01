import {IInputs, IOutputs} from "./generated/ManifestTypes";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import { BorderWidth, Chart, Point, ChartColor } from 'chart.js';
import { array, string } from "prop-types";
import * as $ from 'jquery';
import * as Bootstrap from 'bootstrap';
type DataSet = ComponentFramework.PropertyTypes.DataSet;
const RowRecordId:string = "rowRecId";
const plugin = {
	afterDraw: (chartInstance: Chart, easing: Chart.Easing, options?: any) => { },
};
export class ActivitySummary implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	//chart elements 
	private _numberOfRecords: number;


	private _charttype: string;
	// Flag if control view has been rendered
	private _controlViewRendered: Boolean;

	private contextObj: ComponentFramework.Context<IInputs>;	
	// Div element created as part of this control's main container
	private mainContainer: HTMLDivElement;
	private chartContainer: HTMLDivElement;


	// Table element created as part of this control's table
	private dataTable: HTMLTableElement;

	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		// Need to track container resize so that control could get the available width. The available height won't be provided even this is true
		context.mode.trackContainerResize(true);
		this._controlViewRendered = false;
		
		// Create main table container div. 
		this.mainContainer = document.createElement("div");
		this.mainContainer.classList.add("SimpleTable_MainContainer_Style");
		//Create Chart container
		this.chartContainer = document.createElement("div");
		this.chartContainer.classList.add("SimpleTable_MainContainer_Style");
		this.chartContainer.appendChild(this.createCharts());
		 this.chartContainer.hidden=true;
	
	
		// Create data table container div. 
		this.dataTable = document.createElement("table");
		this.dataTable.classList.add("SimpleTable_Table_Style");
	
		this.mainContainer.appendChild(this.dataTable);
		this.mainContainer.id="mainContainer";
		this.chartContainer.id="chartContainer";
		
		container.appendChild(this.mainContainer);
		container.appendChild(this.chartContainer);

	}

	private getConfigData(): void {

		
		this._charttype = this.contextObj.parameters.chartType == undefined || this.contextObj.parameters.chartType.raw == null ? "" : this.contextObj.parameters.chartType.raw;
	}
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		this.contextObj = context;
	
			if(!context.parameters.smartGridDataSet.loading){
				
				// Get sorted columns on View
				let columnsOnView = this.getSortedColumnsOnView(context);

				if (!columnsOnView || columnsOnView.length === 0) {
                    return;
				}

				let columnWidthDistribution = this.getColumnWidthDistribution(context, columnsOnView);


				while(this.dataTable.firstChild)
				{
					this.dataTable.removeChild(this.dataTable.firstChild);
				}
				

				let isTypeColumn:boolean=false
				columnsOnView.forEach(function (columnItem) {
				if(columnItem.name=="activitytypecode")
				{
					isTypeColumn=true;
				}
				});
				if(isTypeColumn)
				{
				this.dataTable.appendChild(this.createTableHeader(columnsOnView, columnWidthDistribution));		
				this.dataTable.appendChild(this.createTableBody(columnsOnView, columnWidthDistribution, context.parameters.smartGridDataSet));
				this.dataTable.parentElement!.style.height = window.innerHeight - this.dataTable.offsetTop - 70 + "px";
				this.updateCount( context.parameters.smartGridDataSet);
				
				}
				else
				{
					this.mainContainer.innerHTML="Activity Type Column is missing in the selected view"
				}
			}

			$(document).ready(function() {
				$('[data-toggle="toggle"]').off('change').on('change',function(){
				var selectedParent=	$(this).parents();
				var detectedElem =selectedParent.next(".hide");
				detectedElem.toggle();
		
				});

		


			});
			this.getConfigData();
			this.ProcessAllRecordsInDataSet();
			
		
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {};
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
	}

		/**
		 * Get sorted columns on view
		 * @param context 
		 * @return sorted columns object on View
		 */
		private getSortedColumnsOnView(context: ComponentFramework.Context<IInputs>): DataSetInterfaces.Column[]
		{
			if (!context.parameters.smartGridDataSet.columns) {
				return [];
			}
			
			let columns =context.parameters.smartGridDataSet.columns
				.filter(function (columnItem:DataSetInterfaces.Column) { 
					// some column are supplementary and their order is not > 0
					return columnItem.order >= 0 }
				);
			
			// Sort those columns so that they will be rendered in order
			columns.sort(function (a:DataSetInterfaces.Column, b: DataSetInterfaces.Column) {
				return a.order - b.order;
			});


			
			return columns;
		}
			/**
		 * Get column width distribution
		 * @param context context object of this cycle
		 * @param columnsOnView columns array on the configured view
		 * @returns column width distribution
		 */
		private getColumnWidthDistribution(context: ComponentFramework.Context<IInputs>, columnsOnView: DataSetInterfaces.Column[]): string[]{

			let widthDistribution: string[] = [];
			
			// Considering need to remove border & padding length
			let totalWidth:number = context.mode.allocatedWidth - 250;
			let widthSum = 0;
			
			columnsOnView.forEach(function (columnItem) {
				widthSum += columnItem.visualSizeFactor;
			});

			let remainWidth:number = totalWidth;
			
			columnsOnView.forEach(function (item, index) {
				let widthPerCell = "";
				if (index !== columnsOnView.length - 1) {
					let cellWidth = Math.round((item.visualSizeFactor / widthSum) * totalWidth);
					remainWidth = remainWidth - cellWidth;
					widthPerCell = cellWidth + "px";
				}
				else {
					widthPerCell = remainWidth + "px";
				}
				widthDistribution.push(widthPerCell);
			});

			return widthDistribution;

		}

		private createTableHeader(columnsOnView: DataSetInterfaces.Column[], widthDistribution: string[]):HTMLTableSectionElement{

			let tableHeader:HTMLTableSectionElement = document.createElement("thead");
			let tableHeaderRow: HTMLTableRowElement = document.createElement("tr");
			tableHeaderRow.classList.add("SimpleTable_TableRow_Style");
			var thisref=this;
			columnsOnView.forEach(function(columnItem, index){
				if(columnItem.name=="activitytypecode")
				{
				
				let tableHeaderCell = document.createElement("th");
				tableHeaderCell.id="typeHeader";
				tableHeaderCell.classList.add("SimpleTable_TableHeader_Style");
				let innerDiv = document.createElement("div");
				innerDiv.classList.add("SimpleTable_TableCellInnerDiv_Style");
				innerDiv.style.maxWidth = widthDistribution[200];
				innerDiv.innerText = columnItem.displayName;
				tableHeaderCell.appendChild(innerDiv);
				tableHeaderRow.appendChild(tableHeaderCell);

				let tableHeaderCellount = document.createElement("th");
				tableHeaderCellount.id="countHeader";
				tableHeaderCellount.classList.add("SimpleTable_TableHeader_Style");
				let innerDivCounts = document.createElement("div");
				innerDivCounts.classList.add("SimpleTable_TableCellInnerDiv_Style");
				innerDivCounts.style.maxWidth ="30";
				
				innerDivCounts.innerText = "Count";
				tableHeaderCellount.appendChild(innerDivCounts);
				tableHeaderRow.appendChild(tableHeaderCellount);
			
				let showButton:HTMLButtonElement;
					showButton = document.createElement("button");
					showButton.setAttribute("type", "button");
					showButton.innerText = "Chart";
					showButton.classList.add("BUTTON_Chart");
					showButton.classList.add("BUTTON_Chart:hover");
				showButton.id="showChart";
				showButton.addEventListener("click",thisref.toggleContainers);
				innerDivCounts.appendChild(showButton);
			
				
				}
			});
		


			tableHeader.appendChild(tableHeaderRow);
			return tableHeader;
		}




//
		private createTableBody(columnsOnView: DataSetInterfaces.Column[], widthDistribution: string[], gridParam: DataSet):HTMLTableSectionElement{

			let tableBody:HTMLTableSectionElement = document.createElement("tbody");
			tableBody.id="tableBody";

			if(gridParam.sortedRecordIds.length > 0)
			{
				let activityTypeName: string[]=[];
			
				for(let currentRecordId of gridParam.sortedRecordIds){
											
						{
						let activityCode:string=gridParam.records[currentRecordId].getValue("activitytypecode").toString();
						if(!(activityTypeName.includes(activityCode)) || activityTypeName==null || activityTypeName==undefined)
						{
						
						
							let tableBodyActivityName:HTMLTableSectionElement = document.createElement("tbody");
							tableBodyActivityName.id="tableBodyActivityName"
							let tableBodyActivityList:HTMLTableSectionElement = document.createElement("tbody");
							tableBodyActivityList.id="tableBodyActivityList";
							tableBodyActivityList.classList.add("hide");
							tableBodyActivityList.id="tbd_"+activityCode;
							let tableRecordRow: HTMLTableRowElement = document.createElement("tr");
							
						
							let check:HTMLInputElement;
							check=document.createElement("input");
							check.setAttribute("type", "checkbox");
							check.setAttribute("data-toggle", "toggle");
							check.id="id_"+activityCode;
							check.name=activityCode;
						
							let nameLabel:HTMLLabelElement;
							nameLabel=document.createElement("label");
							nameLabel.setAttribute("for", "id_"+activityCode);
						
							tableRecordRow.classList.add("SimpleTable_TableRow_Style");
					

								activityTypeName.push(activityCode);
								tableRecordRow.id=activityCode;
								let tableRecordCell = document.createElement("td");
								tableRecordCell.classList.add("SimpleTable_TableCell_Style");
								let innerDiv = document.createElement("div");
								innerDiv.classList.add("SimpleTable_TableCellInnerDiv_Style");
								innerDiv.style.maxWidth = widthDistribution[200];
							
								nameLabel.innerHTML=gridParam.records[currentRecordId].getFormattedValue("activitytypecode");
								innerDiv.appendChild(nameLabel);
								
								tableRecordCell.appendChild(innerDiv);
								tableRecordRow.appendChild(tableRecordCell);
								
								

								let tableRecordCellCount = document.createElement("td");
								tableRecordCellCount.classList.add("SimpleTable_TableCell_Style");
								let innerDivCount = document.createElement("div");
								innerDivCount.classList.add("SimpleTable_TableCellInnerDiv_Style");
								innerDivCount.style.maxWidth = widthDistribution[200];
								innerDivCount.id="count_"+activityCode;
								innerDivCount.innerText = "0";
								tableRecordCellCount.appendChild(innerDivCount);
								tableRecordRow.appendChild(tableRecordCellCount);
							
								tableBodyActivityName.appendChild(check);
								tableBody.appendChild(tableRecordRow);
							
								// Create sub table header
								
									let tableHeader:HTMLTableRowElement = document.createElement("tr");
									let tableHeaderRow: HTMLTableRowElement = document.createElement("tr");
									tableHeaderRow.classList.add("SimpleTable_TableRow_Style");

									columnsOnView.forEach(function(columnItem, index){
										
										let tableHeaderCell = document.createElement("td");
										tableHeaderCell.classList.add("SimpleTable_TableHeader_Style");
										let innerDiv = document.createElement("div");
										innerDiv.classList.add("SimpleTable_TableCellInnerDiv_Style");
										innerDiv.style.maxWidth = widthDistribution[index];
										innerDiv.innerText = columnItem.displayName;
										tableHeaderCell.appendChild(innerDiv);
										tableHeaderRow.appendChild(tableHeaderCell);
									});

									tableHeader.appendChild(tableHeaderRow);
									tableBodyActivityList.appendChild(tableHeader);
									tableBody.appendChild(tableBodyActivityName);
								//Create activity table for each type.
									tableBodyActivityList.appendChild(this.createActivityTableBody(columnsOnView, widthDistribution, gridParam,activityCode));
								//
								
					
								tableBody.appendChild(tableBodyActivityList);
								tableBodyActivityList.hidden=true;
								


						}
					
							
								
								
						}
					
				
					
				}
				

				

			}
			else
			{
				let tableRecordRow: HTMLTableRowElement = document.createElement("tr");
				let tableRecordCell: HTMLTableCellElement = document.createElement("td");
				tableRecordCell.classList.add("No_Record_Style");
				tableRecordCell.colSpan = columnsOnView.length;
				tableRecordCell.innerText = this.contextObj.resources.getString("PCF_TSTableGrid_No_Record_Found");
				tableRecordRow.appendChild(tableRecordCell)
				tableBody.appendChild(tableRecordRow);
			}

			return tableBody;
		}


	private updateCount( gridParam: DataSet):void{

		for(let currentRecordIdCount of gridParam.sortedRecordIds){

			let activityCodeVal:string=gridParam.records[currentRecordIdCount].getValue("activitytypecode").toString();
			let fieldID:string="count_"+activityCodeVal;
			var currentCountElem=document.getElementById(fieldID) as HTMLDivElement;
			let currentCount=Number(currentCountElem.innerText);
			currentCountElem.innerText=(currentCount+1).toString();

		}
	}
	private createActivityTableBody(columnsOnView: DataSetInterfaces.Column[], widthDistribution: string[], gridParam: DataSet,ActivityType:String):HTMLTableSectionElement{

		let tableBody:HTMLTableSectionElement = document.createElement("tbody");

		if(gridParam.sortedRecordIds.length > 0)
		{
			for(let currentRecordId of gridParam.sortedRecordIds){
				let currentActivityCode:string=gridParam.records[currentRecordId].getValue("activitytypecode").toString();
				if(currentActivityCode==ActivityType)
				{
				let tableRecordRow: HTMLTableRowElement = document.createElement("tr");
				tableRecordRow.classList.add("SimpleTable_TableRow_Style");
				tableRecordRow.addEventListener("click", this.onRowClick.bind(this));
				// Set the recordId on the row dom
				tableRecordRow.setAttribute(RowRecordId, gridParam.records[currentRecordId].getRecordId());
				columnsOnView.forEach(function(columnItem, index){
					let tableRecordCell = document.createElement("td");
					tableRecordCell.classList.add("SimpleTable_TableCell_Style");
					let innerDiv = document.createElement("div");
					innerDiv.classList.add("SimpleTable_TableCellInnerDiv_Style");
					innerDiv.style.maxWidth = widthDistribution[index];
					innerDiv.innerText = gridParam.records[currentRecordId].getFormattedValue(columnItem.name);
					tableRecordCell.appendChild(innerDiv);
					tableRecordRow.appendChild(tableRecordCell);
				});

				tableBody.appendChild(tableRecordRow);
			}
			}
		}
		else
		{
			let tableRecordRow: HTMLTableRowElement = document.createElement("tr");
			let tableRecordCell: HTMLTableCellElement = document.createElement("td");
			tableRecordCell.classList.add("No_Record_Style");
			tableRecordCell.colSpan = columnsOnView.length;
			tableRecordCell.innerText = this.contextObj.resources.getString("No_Record_Found");
			tableRecordRow.appendChild(tableRecordCell)
			tableBody.appendChild(tableRecordRow);
		}

		return tableBody;
	}

	private onRowClick(event: Event): void {
		let rowRecordId = (event.currentTarget as HTMLTableRowElement).getAttribute(RowRecordId);

		if(rowRecordId)
		{
			let gridEntity: string=this.contextObj.parameters.smartGridDataSet.getTargetEntityType().toString();
			let entityReference = this.contextObj.parameters.smartGridDataSet.records[rowRecordId].getNamedReference();
		
			let entityFormOptions = {
				//@ts-ignore
				entityName: entityReference._etn,
				entityId: rowRecordId
			}
			this.contextObj.navigation.openForm(entityFormOptions);
		}
	}

	private toggleContainers():void
	{
	
		var listContainer=document.getElementById("mainContainer");
		//@ts-ignore
		if(listContainer.hidden==true)
		{
			//@ts-ignore
			listContainer.hidden=false;
		}
		else
		{
			//@ts-ignore
			listContainer.hidden=true;
		}
	
		var infoContainer=document.getElementById('chartContainer');
		//@ts-ignore
		if(infoContainer.hidden==true)
		{
			//@ts-ignore
			infoContainer.hidden=false;
		}
		else
		{
			//@ts-ignore
			infoContainer.hidden=true;
		}
		
	}
	private changeChartType(): void
	{

		this.ProcessAllRecordsInDataSet();
	}
	private createCharts(): HTMLButtonElement {
		
		let chartButton:HTMLButtonElement;
		chartButton = document.createElement("button");
		chartButton.setAttribute("type", "button");
		chartButton.innerText = "List ";
		chartButton.classList.add("BUTTON_Chart");
		chartButton.classList.add("BUTTON_Chart:hover");
		chartButton.id="closeChart";
		chartButton.addEventListener("click",this.toggleContainers);
		
		
		
		return chartButton;
	}

	private createChartButton(): HTMLButtonElement {
		
		let showButton:HTMLButtonElement;
		showButton = document.createElement("button");
		showButton.setAttribute("type", "button");
		showButton.innerText = "Chart";
		showButton.classList.add("BUTTON_Chart");
		showButton.classList.add("BUTTON_Chart:hover");
	showButton.id="showChart";
	showButton.addEventListener("click",this.toggleContainers)
	
		return showButton;
	}
	
// chart methods
private ProcessAllRecordsInDataSet():void {
	//We make sure that the data set loading is finished.
	if (!this._controlViewRendered && !this.contextObj.parameters.smartGridDataSet.loading &&( this.contextObj.parameters.smartGridDataSet.sortedRecordIds.length>0)) {
		if (this.contextObj.parameters.smartGridDataSet.paging != null && this.contextObj.parameters.smartGridDataSet.paging.hasNextPage == true) {

			//set page size
			this.contextObj.parameters.smartGridDataSet.paging.setPageSize(5000);
			//load next paging
			this.contextObj.parameters.smartGridDataSet.paging.loadNextPage();
		} else {
			this._controlViewRendered = true;

		var listType:string[]=[];
		


			var dataSetValue = new Array();
			this.contextObj.parameters.smartGridDataSet.sortedRecordIds.forEach((currentRecordId) => {
				let recordType = this.contextObj.parameters.smartGridDataSet.records[currentRecordId].getFormattedValue("activitytypecode");
				let recordId = currentRecordId;
				let ActivtyObject: { type: string, id: string } = { id: recordId, type: recordType };
				dataSetValue.push(ActivtyObject);
				if(!(listType.includes(recordType)) ||( listType==null) || (listType==undefined))
						{
							listType.push(recordType);
						}
			});

		
			var dataValue = new Array(listType.length);
			let iteration = 0;
			listType.forEach((activitytype) => {
				let currentValue = 0;
				dataSetValue.filter(function (item) {
					if (item.type == activitytype) {
						currentValue++;
					}
				});
				dataValue[iteration] = currentValue;
				iteration++;
			});
			this.GetChart(listType, dataValue);
			//Start the process for each records in the dataset (subgrid,view...).
		}
	}
}

private GetChart(labelValue: Array<string>, dataValue: Array<any>) {


		
	const chartOptions: Chart.ChartOptions = {
	
				legend: {
					display: true, labels: {
						fontColor: '#000000'
					}, position: 'top'
				},
				//scale: scaleOptions,
				responsive: true,
				animation: {
					animateScale: true,
					animateRotate: true
				},
				title: {
					display:  true,
					text: "Activity Summary"
				},
			};
			var _canvasElement = document.createElement('canvas');
			_canvasElement.id = "myChart";
			_canvasElement.width=450;
			_canvasElement.height=100;
	
	
			
			const chart: Chart = new Chart(_canvasElement, {
				type: this._charttype,
				data: {
					labels: labelValue,
					datasets: [{ label: 'Activity Summary', data: dataValue, backgroundColor: ["#F24F21", "#7FBA00", "#00A4EF", "#FFB900", "#006EC4", "#7719AA"]  }],
				},
				options: chartOptions
			});
		
		this.chartContainer.appendChild(_canvasElement);
	
}


//
}