// @ts-nocheck
import fs from "fs";



//This is a temporary script which will be used to prepare the final data json

// Reading the file
function main() {
    fs.readFile("../../../public/recipes.json", "utf-8", function (err, originalString) {
            if (err) {
                console.error('Error reading file', err);
            } else {
                fs.writeFile(
                    "data_v0.json",
                    JSON.stringify(transformData(JSON.parse(originalString)), null, 2),
                    function (err) {
                        if (err) {
                            return console.error(err);
                        }

                        // If no error the remaining code executes
                        console.log(" Finished writing ");
                    }
                )
            }
        }
    )
}

/**
 * @typedef {Object} Recipe
 * @property {string} building - The building where the recipe is crafted.
 * @property {string} name - The name of the recipe.
 * @property {number} craftTime - The time it takes to craft the recipe, in seconds.
 * @property {string} resource1 - The primary resource required.
 * @property {string} resource2 - Resource number 2.
 * @property {string} resource3 - Resource number 3.
 * @property {string} resource4 - Resource number 4.
 * @property {number} resQty1 - The quantity of the primary resource required.
 * @property {number} resQty2 - The quantity of resource number 2.
 * @property {number} resQty3 - The quantity of resource number 3.
 * @property {number} resQty4 - The quantity of resource number 4.
 * @property {string} output1 - The primary output of the recipe.
 * @property {number} outQty1 - The quantity of the primary output produced.
 * @property {string} output2 - The second output of the recipe.
 * @property {number} outQty2 - The quantity of the second output produced.
 */


//TODO missing data:
// resource metrics m3 or p - boolean isHard should be fine...
// extractors...
//
/**
 * Transform list of recipes (from the json) to the map of relevant entities
 *  @param {Recipe []} recipes - Array
 *  @returns {Object} Description of the return value.
 */
function transformData(recipes = []) {
    const resultData = {buildingMap: {}, resourceMap: {}, recipeMap: {}};
    //TODO For v0 do not bother with keys - just use name - don't care about capital and whitespaces - will fix later
    recipes.forEach((recipe) => {
        //Add new building
        if (!resultData.buildingMap[recipe.building]) {
            resultData.buildingMap[recipe.building] = {
                name: recipe.building, //FIXME It is duplicate - remove if not needed as QOL
                // size: {} //TODO gather sizes. Is height needed?
                recipes: []
            };
        }

        //Register recipe
        const {
            resource1,
            resource2,
            resource3,
            resource4,
            resQty1,
            resQty2,
            resQty3,
            resQty4,
            outQty1,
            outQty2,
            output1,
            output2,
            ...newRecipe
        } = recipe
        newRecipe.inputs = [{resource: resource1, quantity: resQty1}];
        if (resource2) newRecipe.inputs.push({resource: resource2, quantity: resQty2});
        if (resource3) newRecipe.inputs.push({resource: resource3, quantity: resQty3});
        if (resource4) newRecipe.inputs.push({resource: resource4, quantity: resQty4});
        newRecipe.outputs = [{resource: output1, quantity: outQty1}];
        if (output2) newRecipe.outputs.push({resource: output2, quantity: outQty2});
        resultData.recipeMap[newRecipe.name] = newRecipe;
        resultData.buildingMap[newRecipe.building].recipes.push(newRecipe.name);

        //Register resources and
        newRecipe.inputs.forEach(({resource}) => {
            if (!resultData.resourceMap[resource]) {
                resultData.resourceMap[resource] = { name: resource, usedIn: [], producedIn: []};
            }
            resultData.resourceMap[resource].usedIn.push(newRecipe.name);
        })
        newRecipe.outputs.forEach(({resource}) => {
            if (!resultData.resourceMap[resource]) {
                resultData.resourceMap[resource] = { name: resource, usedIn: [], producedIn: []};
            }
            resultData.resourceMap[resource].producedIn.push(newRecipe.name);
        })
    })
    return resultData
}

main();



