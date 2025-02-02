/**
 * @fileoverview This file creates an horizontal stacked bar graphic. 
 * Each bar portion shows the width % of the portion, hovering will also explain what value is being visualized there.
 * @package Requires React package. 
 * @author Marco Expósito Pérez
 */
//Packages
import React from "react";
import { Dimensions } from "../constants/nodes";
import { IStringNumberRelation } from "../constants/perspectivesTypes";
//Local files
import { BarPortion } from "./BarPortion";

interface StackedBarGraphProps {
    /**
     * Key/tittle of the data represented in the graph.
     */
    tittle: string,
    /**
     * Dimension of the data represented in the graph.
     */
    dim: Dimensions | undefined,
    /**
     * pairs (string, number) that will be represented in the stacked bar. Props must include the index of the dimension
     * for graphs of attributes that have a dimension.
     */
    data: IStringNumberRelation[],

}

/**
 * UI component that shows data in a horizontal stackedbar.
 */
export const StackedBarGraph = ({
    tittle,
    dim,
    data,
}: StackedBarGraphProps) => {

    const bars = new Array<React.ReactNode>();

    //Hack to represent values whose all value is 0.
    if (isAllZero(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i].count = Number((1 / data.length * 100).toFixed(2));
        }
    }

    for (let i = 0; i < data.length; i++) {

        bars.push(
            <BarPortion
                key={i}
                data={data[i]}
                dim={dim}
                dimensionIndex={dim !== undefined ? data[i].props : 0}
                portionOrder={i}
            />
        );
    }


    return (
        <div>
            <div className="stacked-bar-tittle">{tittle}</div>
            <div className="stacked-bar-container row">
                {bars}
            </div>
        </div>);
};


function isAllZero(data: IStringNumberRelation[]) {
    let isAllZero = true;

    for (let i = 0; i < data.length; i++) {
        if (data[i].count !== 0) {
            return false;
        }
    }

    return isAllZero;
}