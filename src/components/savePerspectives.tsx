/**
 * @fileoverview This file creates a button that can be clicked and will execute the onClick function prop.
 * The button can also be disabled to negate any interaction with it, or change its colors with the state : ButtonState
 * property.
 * If auto toggle parameter is true, the button will automaticaly change its state between active and 
 * unactive when clicked.
 * @package Requires React package. 
 * @author Marco Expósito Pérez
 */

//Packages
import React, { useState } from "react";
import { Button } from "../basicComponents/Button";
import { PerspectiveId } from "../constants/perspectivesTypes";
import { EButtonState } from "../constants/viewOptions";
import RequestManager from "../managers/requestManager";

const innerPanelStyle: React.CSSProperties = {
    width: "90vw",
    height: "90vh",

    //Center the panel in the view screen
    position: "fixed",
    top: "50%",
    left: "50%",
    marginTop: "-45vh",
    marginLeft: "-45vw",

    background: "var(--bodyBackground)",
    borderRadius: "15px",

    overflowY: "auto",
    border: "2px solid var(--primaryButtonColor)",
    borderLeft: "10px solid var(--primaryButtonColor)"
};

const topButtonsStyle: React.CSSProperties = {
    marginTop: "10px",
    height: "5vh",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
}

interface SavePerspectivesProps {
    isActive: boolean,
    setIsActive: Function,
    allPerspectivesIds: PerspectiveId[],
    requestManager: RequestManager
}
/**
 * UI component that executes a function when clicked.
 */
export const SavePerspective = ({
    isActive,
    setIsActive,
    allPerspectivesIds,
    requestManager
}: SavePerspectivesProps) => {

    const [states, setStates] = useState<Map<string, boolean>>(init(allPerspectivesIds));
    const [allToggle, setAllToggle] = useState<boolean>(false);

    const perspectiveRows = getPerspectivesInARow(allPerspectivesIds, states, setStates);
    return (
        <div className={isActive ? "toVisibleAnim dark-background" : "toHiddenAnim dark-background"}>
            <div style={innerPanelStyle}>
                {/*Row with the buttons to exit the application and the tittle of this application*/}
                <div key={0} style={topButtonsStyle}>
                    <span />
                    <h3 key={1} className="save-perspectives-tittle">
                        Save Perspectives
                    </h3>
                    <span key={2} style={{ marginRight: "10px" }}>
                        <Button
                            key={1}
                            content=""
                            extraClassName="dark btn-close"
                            onClick={() => { setIsActive(false); }}
                            postIcon={<div className="icon-close"></div>}
                        />
                    </span>
                </div>
                <div style={{ margin: "10px 2% 0px 2%" }}>
                    {/*Row with a checkbox to auto toggle all, and the button to download all selected perspectives*/}
                    <div style={{
                        border: "1px solid black",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0px 2%"
                    }}>
                        <div>
                            <input type="checkbox" id="SelectAll-cb" style={{ scale: "2" }} checked={allToggle}
                                onChange={() => { }}
                                onClick={() => {
                                    const newMap: Map<string, boolean> = new Map<string, boolean>();

                                    for (let i = 0; i < allPerspectivesIds.length; i++) {
                                        newMap.set(allPerspectivesIds[i].id, !allToggle);
                                    }

                                    setStates(newMap);
                                    setAllToggle(!allToggle);
                                }}
                            />
                            <label style={{ marginLeft: "5px" }} htmlFor="SelectAll-cb"> Toggle All</label>
                        </div>
                        <div style={{ margin: "10px 5px" }}>
                            <Button
                                content="Download perspectives"
                                extraClassName="primary"
                                onClick={() => {

                                    for (let i = 0; i < allPerspectivesIds.length; i++) {
                                        if (states.get(allPerspectivesIds[i].id)) {
                                            console.log("Download " + allPerspectivesIds[i].id.split(" ")[0] + " whose name is" + allPerspectivesIds[i].name);
                                            //downloadFile("./public/data", allPerspectivesIds[i].name + ".json");
                                            requestManager.requestPerspectiveConfig(allPerspectivesIds[i], () => { });
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                    {/*Panel with all perspectives to pick from*/}
                    {/* <div style={{ border: "1px solid black", marginTop: "1%", maxHeight: "65vh", overflow: "auto" }}>
                        {perspectiveRows}
                    </div> */}
                    <div style={{
                        border: "1px solid black", marginTop: "1%", maxHeight: "65vh", overflow: "auto",
                        display: "flex", flexDirection: "column"
                    }}>
                        {perspectiveRows}
                    </div>
                </div>
            </div>
        </div >
    );
};


function getPerspectivesInARow(allPerspectivesIds: PerspectiveId[], states: Map<string, boolean>, setStates: Function): React.ReactNode[] {
    const rows: React.ReactNode[] = [];

    for (let i = 0; i < allPerspectivesIds.length; i++) {
        let btnRow =
            <Button
                key={i}
                content={`${allPerspectivesIds[i].name}`}
                state={states.get(allPerspectivesIds[i].id) ? EButtonState.active : EButtonState.unactive}
                extraClassName="btn-dropdown"
                onClick={() => {
                    let newMap = new Map<string, boolean>(states);

                    newMap.set(allPerspectivesIds[i].id, states.get(allPerspectivesIds[i].id) ? false : true);
                    setStates(newMap);
                }}
            />

        rows.push(btnRow);
    }

    return [rows];
}

function init(allPerspectivesIds: PerspectiveId[]) {

    const initialState: Map<string, boolean> = new Map<string, boolean>();

    for (let i = 0; i < allPerspectivesIds.length; i++) {
        initialState.set(allPerspectivesIds[i].id, false);
    }

    return initialState;
}

function downloadFile(url: string, fileName: string) {
    fetch(url, { method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer' })
        .then(res => res.blob())
        .then(res => {
            const aElement = document.createElement('a');
            aElement.setAttribute('download', fileName);
            const href = URL.createObjectURL(res);
            aElement.href = href;
            // aElement.setAttribute('href', href);
            aElement.setAttribute('target', '_blank');
            aElement.click();
            URL.revokeObjectURL(href);
        });
};
