/**
 * @fileoverview This File contains diferent interfaces used to validate a configuration tool seed and to create the
 * configuration json sent to the CM.
 * @author Marco Expósito Pérez
 */

export enum ESimilarity {
    Same,
    Similar,
    Different
}

//#region Seed interfaces
export interface IConfigurationSeed {
    artwork_attributes: IArtworkAttribute[];
    user_attributes: INameAndTypePair[];
    interaction_similarity_functions: ISimilarityFunction[];
    algorithm: IAlgorithm[],
    artworks: INameAndIdPair[],
    configToolType: EConfigToolTypes,
    HecthStructure: boolean
}

export interface IArtworkAttribute {
    on_attribute: INameAndTypePair,
    sim_function: IAlgorithm[],
}

export interface ISimilarityFunction {
    name: string;
    params: any[];
    on_attribute: INameAndTypePair;
    interaction_object: INameAndTypePair;
}

export interface INameAndTypePair {
    att_name: string,
    att_type: string,
}

export interface IAlgorithm {
    name: string,
    params: any[],
    default: boolean
}

export interface INameAndIdPair {
    name: string,
    id: string,
}

export const defaultWeightValue = 0.5;
export const defaultArtworkWeightValue = 0.5;

export enum EConfigToolTypes {
    GENERIC,
    HECTH,
    DMH,
}

export const midSentenceMap = new Map<EConfigToolTypes, string>();
midSentenceMap.set(EConfigToolTypes.GENERIC, "in");
midSentenceMap.set(EConfigToolTypes.HECTH, "for users with");
midSentenceMap.set(EConfigToolTypes.DMH, "in");

export const lastSentenceMap = new Map<EConfigToolTypes, string>();
lastSentenceMap.set(EConfigToolTypes.GENERIC, "artworks.");
lastSentenceMap.set(EConfigToolTypes.HECTH, "beliefs.");
lastSentenceMap.set(EConfigToolTypes.DMH, "concepts.");

export const rightSideSentenceMap = new Map<EConfigToolTypes, string>();
rightSideSentenceMap.set(EConfigToolTypes.GENERIC, "Artworks Attributes");
rightSideSentenceMap.set(EConfigToolTypes.HECTH, "Beliefs");
rightSideSentenceMap.set(EConfigToolTypes.DMH, "Concepts Attributes");

export const similarity1Map = new Map<EConfigToolTypes, Array<ESimilarity>>();
similarity1Map.set(EConfigToolTypes.GENERIC, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);
similarity1Map.set(EConfigToolTypes.HECTH, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);
similarity1Map.set(EConfigToolTypes.DMH, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);

export const similarity2Map = new Map<EConfigToolTypes, Array<ESimilarity>>();
similarity2Map.set(EConfigToolTypes.GENERIC, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);
similarity2Map.set(EConfigToolTypes.HECTH, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);
similarity2Map.set(EConfigToolTypes.DMH, [ESimilarity.Similar, ESimilarity.Same, ESimilarity.Different]);


//#endregion

export function initArtworksAttrDrop(attributes: IArtworkAttribute[]): Map<string, boolean[]> {
    const output = new Map<string, boolean[]>();
    for (let attr of attributes) {
        const algArray: boolean[] = [];

        for (const alg of attr.sim_function) {
            algArray.push(alg.default);
        }

        output.set(attr.on_attribute.att_name, algArray);
    }

    return output;
}

export function initAlgorythmDrop(algorythms: IAlgorithm[]): IAlgorithm {
    for (let alg of algorythms) {
        if (alg.default) {
            return alg;
        }
    }

    return algorythms[0];
}

export function initMidSentence(type: EConfigToolTypes) {
    let output = midSentenceMap.get(type);
    if (output === undefined) output = "";

    return output;
}

export function initLastSentence(type: EConfigToolTypes) {
    let output = lastSentenceMap.get(type);
    if (output === undefined) output = "";

    return output;
}

export function initRightSideSentence(type: EConfigToolTypes) {
    let output = rightSideSentenceMap.get(type);
    if (output === undefined) output = "";

    return output;
}

export function initSimilarity1(type: EConfigToolTypes, setSimilarity: Function) {
    let availableValues = similarity1Map.get(type);
    if (availableValues === undefined) {
        availableValues = [ESimilarity.Same];
    }

    setSimilarity(availableValues[0]);

    return availableValues;
}

export function initSimilarity2(type: EConfigToolTypes, setSimilarity: Function) {
    let availableValues = similarity2Map.get(type);
    if (availableValues === undefined) {
        availableValues = [ESimilarity.Same];
    }

    setSimilarity(availableValues[0]);

    return availableValues;
}

//#region Create config file

export function createConfigurationFile(seed: IConfigurationSeed, citizenAttr: Map<string, boolean>,
    artworksAttr: Map<string, boolean>, artworksDropdownAttr: Map<string, boolean[]>,
    selectedOption: ISimilarityFunction, similarity1: ESimilarity, similarity2: ESimilarity, perspectiveName: string,
    algorithm: IAlgorithm, algWeight: number, selectedArtwork: INameAndIdPair | undefined, artworksWeight: number) {

    let newConfig: any = {
        user_attributes: [],
        interaction_similarity_functions: [],
        similarity_functions: []
    };

    fillUserAttributes(citizenAttr, newConfig);
    fillInteractionSimilarityFunctions(selectedOption, similarity1, seed, newConfig);
    fillSimilarityFunctions(similarity2, newConfig, seed, artworksAttr, artworksDropdownAttr, selectedArtwork);

    let configName = perspectiveName.replaceAll(" ", "_");

    if (configName === "") {
        configName = getDefaultName(similarity1, configName, newConfig, seed, selectedOption, similarity2, artworksAttr,
            selectedArtwork?.name);
    }

    newConfig["name"] = configName;
    newConfig["id"] = configName;

    newConfig["algorithm"] = {
        "name": algorithm.name,
        "params": algorithm.params,
        "weight": algWeight,
        "weightArtworks": artworksWeight
    };

    return newConfig;
}

function getDefaultName(similarity1: ESimilarity, configName: string, newConfig: any, seed: IConfigurationSeed,
    selectedOption: ISimilarityFunction, similarity2: ESimilarity, artworksAttr: Map<string, boolean>,
    selectedArtworkName: string | undefined) {

    switch (similarity1) {
        case ESimilarity.Same: {
            configName = "E-";
            break;
        }
        case ESimilarity.Similar: {
            configName = "S-";
            break;
        }
        case ESimilarity.Different: {
            configName = "D-";
            break;
        }
    }

    if (newConfig.interaction_similarity_functions.length !== 0)
        configName += selectedOption.on_attribute.att_name;

    switch (similarity2) {
        case ESimilarity.Same: {
            configName += "-E-";
            break;
        }
        case ESimilarity.Similar: {
            configName += "-S-";
            break;
        }
        case ESimilarity.Different: {
            configName += "-D-";
            break;
        }
    }

    configName += "artworks ";
    if (selectedArtworkName !== undefined && similarity2 === ESimilarity.Same) {
        configName += `${selectedArtworkName}`;
    }

    let artwork_attributesName: String[] = [];
    seed.artwork_attributes.forEach((value) => {
        const name = value.on_attribute.att_name;

        if (artworksAttr.get(name)) {
            artwork_attributesName.push(value.on_attribute.att_name);
        }
    });

    if (artwork_attributesName.length && similarity2 !== ESimilarity.Same)
        configName = configName + " (" + artwork_attributesName.join(", ") + ")";

    return configName;
}

function fillSimilarityFunctions(similarity2: ESimilarity, newConfig: any, seed: IConfigurationSeed, artworksAttr: Map<string, boolean>,
    artworksDropdownAttr: Map<string, boolean[]>, selectedArtwork: INameAndIdPair | undefined) {

    switch (similarity2) {

        case ESimilarity.Same: {
            let sim;
            if (selectedArtwork === undefined) {
                sim = {
                    "sim_function": {
                        "name": "EqualSimilarityDAO",
                        "params": [],
                        "on_attribute": {
                            "att_name": "id",
                            "att_type": "String"
                        }
                    }
                };


            } else {
                sim = {
                    "sim_function": {
                        "name": "EqualSimilarityDAO",
                        "params": [
                            {
                                "artworkId": `${selectedArtwork.id}`,
                                "att_type": "String"
                            }
                        ],
                        "on_attribute": {
                            "att_name": "id",
                            "att_type": "String"
                        }
                    }
                };
            }

            newConfig.similarity_functions.push(sim);
            break;
        }
        case ESimilarity.Similar: {
            seed.artwork_attributes.forEach((value) => {
                const name = value.on_attribute.att_name;

                if (artworksAttr.get(name)) {

                    const sim_functions = artworksDropdownAttr.get(name);
                    if (sim_functions) {
                        for (let i = 0; i < value.sim_function.length; i++) {
                            if (sim_functions[i]) {
                                newConfig.similarity_functions.push({
                                    sim_function: {
                                        dissimilar: false,
                                        name: value.sim_function[i].name,
                                        on_attribute: value.on_attribute,
                                        params: value.sim_function[i].params,
                                    }
                                });
                            }
                        }
                    }
                }
            });

            if (newConfig.similarity_functions.length === 0) {
                let sim = {
                    "sim_function": {
                        "name": "EqualSimilarityDAO",
                        "params": [],
                        "on_attribute": {
                            "att_name": "id",
                            "att_type": "String"
                        }
                    }
                };
                newConfig.similarity_functions.push(sim);
            }

            break;
        }
        case ESimilarity.Different: {
            seed.artwork_attributes.forEach((value) => {
                const name = value.on_attribute.att_name;

                if (artworksAttr.get(name)) {
                    newConfig.similarity_functions.push({
                        sim_function: {
                            dissimilar: true,
                            //name: value.name,
                            on_attribute: value.on_attribute,
                            //params: value.params,
                        }
                    });
                }
            });

            break;
        }
    }
}

function fillInteractionSimilarityFunctions(selectedOption: ISimilarityFunction, similarity1: ESimilarity, seed: IConfigurationSeed, newConfig: any) {
    switch (similarity1) {
        case ESimilarity.Same: {
            let obj = { sim_function: {} as any };
            obj.sim_function = JSON.parse(JSON.stringify(selectedOption));

            obj.sim_function.name = "EqualSimilarityDAO";

            newConfig.interaction_similarity_functions.push(obj);
            break;
        }
        case ESimilarity.Similar: {
            let obj = { sim_function: {} as any };
            obj.sim_function = JSON.parse(JSON.stringify(selectedOption));

            newConfig.interaction_similarity_functions.push(obj);

            break;
        }
        case ESimilarity.Different: {
            let obj = { sim_function: {} as any };
            obj.sim_function = JSON.parse(JSON.stringify(selectedOption));
            obj.sim_function.dissimilar = true;
            newConfig.interaction_similarity_functions.push(obj);

            break;
        }
    }

}

function fillUserAttributes(citizenAttr: Map<string, boolean>, newConfig: any) {
    let defaultValue: any = undefined;
    let hasValue = false;

    citizenAttr.forEach((value, key) => {

        if (defaultValue === undefined) {
            defaultValue = {
                att_name: key,
                att_type: "String"
            };
        }

        if (value) {
            hasValue = true;
            newConfig.user_attributes.push({
                att_name: key,
                att_type: "String"
            });
        }
    });

    if (!hasValue) {
        newConfig.user_attributes.push(defaultValue);
    }
}


//#endregion