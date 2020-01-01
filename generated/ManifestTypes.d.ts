/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    chartType: ComponentFramework.PropertyTypes.EnumProperty<"pie" | "radar" | "bar" | "line" | "polar" | "doughnut">;
    smartGridDataSet: ComponentFramework.PropertyTypes.DataSet;
}
export interface IOutputs {
}
