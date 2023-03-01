/**
 * @fileoverview This file creates a dropdown that show/hides the legend of the app. This also creates the content.
 * The legend allows the user to understand the relations between the node's dimensions and the value of 
 * its explicit communities.
 * The user can also toggle any Legend value to hide all node's with that value.
 * @package Requires React package. 
 * @author Marco Expósito Pérez
 */
//Constants
import { DimAttribute, Dimensions, nodeConst } from '../constants/nodes';
import { EButtonState } from '../constants/viewOptions';
//Packages
import React from "react";
//Local files
import { Button } from '../basicComponents/Button';
import { ColorStain } from '../basicComponents/ColorStain';
import { ILegendData } from '../constants/auxTypes';
import { DropMenu, EDropMenuDirection } from '../basicComponents/DropMenu';
import { ShapeForm } from '../basicComponents/ShapeForm';
import { CTranslation, ITranslation } from '../managers/CTranslation';

const buttonContentRow: React.CSSProperties = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
}

const columnStyle: React.CSSProperties = {
    borderRight: "1px solid black",
    width: "15vw",
    textAlign: "center",
}

interface LegendTooltipProps {
    /**
     * Data source to create the legend content.
     */
    legendData: ILegendData | undefined;
    /**
     * Configuration of the legend with the explicit communities that should be hidden/shown.
     */
    legendConf: Map<string, Map<string, boolean>>;
    /**
     * Function to change the legend configuration that changes how nodes will be seen.
     */
    onLegendClick: Function;

    translation: ITranslation | undefined;
}

/**
 * Dropdown component that toggles the legend of the active perspectives. The legend can be clicked to toggle some
 * nodes visibility based on their explicit community values.
 */
export const LegendComponent = ({
    legendData,
    legendConf,
    onLegendClick,
    translation,
}: LegendTooltipProps) => {

    if (legendData !== undefined && legendData.dims !== undefined && legendData.dims.length > 0) {

        const legendRows: React.ReactNode[] = getLegendButtons(legendData.dims, legendConf, onLegendClick, translation);
        const anonRows: React.ReactNode = getAnonButtons(legendData.anonGroup, legendData.anonymous, legendConf,
            onLegendClick, translation);

        const legendContent =
            <React.Fragment key={0}>
                <div key={1} className='row' style={{ direction: "ltr" }}>
                    {legendRows}
                </div>
                <div key={2} className='row' style={{ direction: "ltr" }}>
                    {anonRows}
                </div>
            </React.Fragment>
        return (
            <div className="legend-container">
                <DropMenu
                    items={[legendContent]}
                    content={translation?.toolbar.legend.name}
                    extraClassButton="primary"
                    closeWhenOutsideClick={false}
                    menuDirection={EDropMenuDirection.down}
                    postIcon={<div className="plus" />}
                    hoverText="Open Legend"
                />
            </div>
        );

    } else {
        return (
            <DropMenu
                items={[]}
                content={translation?.toolbar.legend.noLegend}
                extraClassButton="primary"
                closeWhenOutsideClick={false}
                menuDirection={EDropMenuDirection.down}
                postIcon={<div className="plus" />}
            />)

    }
};

/**
 * Get all the buttons that creates the legend tooltip.
 * @param legendData Data that creates the legend.
 * @param legendConf Configuration of what is active/inactive in the legend.
 * @param onClick Function executed when a legend row is clicked.
 * @returns all the column buttons.
 */
function getLegendButtons(legendData: DimAttribute[], legendConf: Map<string, Map<string, boolean>>,
    onClick: Function, translation: ITranslation | undefined): React.ReactNode[] {

    const rows = new Array<React.ReactNode>();

    for (let i = 0; i < legendData.length; i++) {
        if (legendData[i].active) {
            const buttonsColumn = new Array<React.ReactNode>();

            let valueMap = legendConf.get(legendData[i].key);
            if (valueMap === undefined) {
                legendConf.set(legendData[i].key, new Map<string, boolean>());
                valueMap = legendConf.get(legendData[i].key);
            }

            for (let j = 0; j < legendData[i].values.length; j++) {
                const value = legendData[i].values[j];
                let valueText = value;

                buttonsColumn.push(
                    <Button
                        key={i * 10 + j}
                        content={<div style={buttonContentRow}> {valueText} </div>}
                        state={valueMap!.get(value) ? EButtonState.active : EButtonState.unactive}
                        extraClassName={"btn-legend btn-dropdown"}
                        onClick={() => {

                            valueMap!.set(value, !valueMap!.get(value));
                            onClick(new Map(legendConf));
                        }}
                        postIcon={
                            <div style={{ paddingLeft: "5px" }}>
                                {getIcon(valueText, legendData[i].dimension, j)}
                            </div>}
                    />
                );
            }

            const colum =
                <div className='col' style={getLegendColumnStyle(i === legendData.length)}
                    key={i}>
                    <h3 className='legend-column-tittle' title={legendData[i].key}>{legendData[i].key} </h3>
                    {buttonsColumn}
                </div>;

            rows.push(colum);
        }
    }

    return rows;
}

/**
 * Returns the content of a legend button based on data from a community and its related values and dimensions.
 * @param value value of the attribute of this row.
 * @param dim dimension of the attribute of this row.
 * @param index index of the community.
 * @returns a react component.
 */
const getIcon = (value: string, dim: Dimensions, index: number): React.ReactNode => {
    let icon: React.ReactNode = "";

    switch (dim) {
        case Dimensions.Color:
            return (
                <ColorStain
                    color={nodeConst.nodeDimensions.getColor(index)}
                />)
        case Dimensions.Shape:
            return (
                <ShapeForm
                    scale={1}
                    shape={nodeConst.nodeDimensions.getShape(index).name}
                />
            )
        case Dimensions.Border:
            return (
                <div className="col-3 box" style={{ borderColor: nodeConst.nodeDimensions.getBorder(index), borderWidth: "4px" }}></div>
            )
            break;
        default:
            return <div> ERROR WHILE CREATING THIS ROW CONTENT</div>
    }
}

function getAnonButtons(anonGroups: boolean, anonymous: boolean, legendConf: Map<string, Map<string
    , boolean>>, onClick: Function, translation: ITranslation | undefined): React.ReactNode {

    let output: React.ReactNode = undefined;

    if (anonymous) {
        let buttonState: EButtonState = EButtonState.unactive;

        let valueMap = legendConf.get(`${nodeConst.anonymousGroupKey}User`);
        if (valueMap === undefined) {
            legendConf.set(`${nodeConst.anonymousGroupKey}User`, new Map<string, boolean>());
            valueMap = legendConf.get(`${nodeConst.anonymousGroupKey}User`);
        }

        if (valueMap?.get(`${nodeConst.anonymousGroupKey}User`)) {
            buttonState = EButtonState.active;
        };

        output =
            <div key={2} className='col' >
                <h3 key={1} className="legend-column-tittle" title={`${translation?.legend.anonymousRow}`} >
                    {`${translation?.legend.anonymousRow}`}
                </h3>
                <Button
                    key={2}
                    content={`${translation?.legend.anonymousExplanation}`}

                    state={buttonState}
                    extraClassName={"btn-legend btn-dropdown"}
                    onClick={() => {
                        valueMap!.set(`${nodeConst.anonymousGroupKey}User`, !valueMap!.get(`${nodeConst.anonymousGroupKey}User`));
                        onClick(new Map(legendConf));
                    }}
                    postIcon={
                        <img alt={`${translation?.legend.anonymousRow} icon`} src={nodeConst.defaultAnon} style={{ height: "1.4rem" }}></img>
                    }
                />

            </div >;
    }
    return output;
}

function getLegendColumnStyle(isLast: boolean): React.CSSProperties {
    let newStyle: React.CSSProperties = (JSON.parse(JSON.stringify(columnStyle)));

    if (isLast) {
        newStyle.borderRight = "none";
    }

    return newStyle;
}