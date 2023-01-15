class Recipe {
    constructor(name) {
        this.name = name;
        this.ingredients = [];
    }
    addIngredient(name, amount) {
        this.ingredients.push(new Ingredient(name, amount))
    }
}

class Ingredient {
    constructor(name, amount) {
        this.name = name;
        this.amount = amount;
    }
}

class RecipeService {
    static url = 'https://63c1cc29376b9b2e6484443b.mockapi.io/endpoint';

    static getAllRecipes() {
        return $.get(this.url);
    }

    static getRecipe(id) {
        return $.get(this.url + `/${id}`)
    }

    static createRecipe(recipe) {
        return $.post(this.url, recipe)
    }

    static updateRecipe(recipe) {
        return $.ajax({
            url: this.url + `/${recipe._id}`,
            dataType: 'json',
            data: JSON.stringify(recipe),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteRecipe(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static recipes;

    static getAllRecipes() {
        RecipeService.getAllRecipes().then(recipes => this.render(recipes));
    }

    static createRecipe(name) {
        RecipeService.createRecipe(new Recipe(name))
        .then(() => {
            return RecipeService.getAllRecipes()
        })
        .then((recipes) => this.render(recipes))
    }

    static deleteRecipe(id) {
        RecipeService.deleteRecipe(id)
            .then(() => {
                return RecipeService.getAllRecipes()
            })
            .then((recipes) => this.render(recipes))
    }

    static addIngredient(id) {
        for (let recipe of this.recipes) {
            if (recipe._id == id) {
                recipe.ingredients.push(new Recipe($(`#${recipe._id}-ingredient-name`).val(), $(`#${recipe._id}-ingredient-amount`).val()));
                RecipeService.updateRecipe() 
                .then(() => {
                    return RecipeService.getAllRecipes()
                })
                .then((recipes) => this.render(recipes))
            }
        }
    }

    static deleteIngredient(recipeId, ingredientId) {
        for(let recipe of this.recipes) {
            if(recipe.id == recipeId) {
                for (let ingredient of recipe.ingredients) {
                    if(ingredient._id == ingredientId) {
                        recipe.ingredients.splice(recipe.ingredients.indexOf(ingredient), 1)
                        RecipeService.updateRecipe(recipe)
                            .then(() => {
                                return RecipeService.getAllRecipes
                            })
                            .then((recipes) => this.render(recipes))
                    }
                }
            }
        }
    }

    static render(recipes) {
        this.recipes = recipes;
        $('#app').empty();
        for (let recipe of recipes) {
            $('#app').prepend(
                `<div id="${recipe._id}" class="card">
                    <div class="card-header">
                        <h2>${recipe.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteRecipe('${recipe._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${recipe._id}-ingredient-name" class="form-control" placeholder="Ingredient Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${recipe._id}-ingredient-amount" class="form-control" placeholder="Ingredient Amount">
                                </div>
                            </div> 
                            <button id="${recipe._id}-new-ingredient" onclick="DOMManager.addIngredient('${recipe._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let ingredient of recipe.ingredients) {
                $(`#${recipe._id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${ingredient._id}"><strong>Name: </strong> ${ingredient.name}</span>
                    <span id="amount-${ingredient._id}"><strong>Amount: </strong> ${ingredient.amount}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deleteIngredient('${recipe._id}', '${ingredient._id}')">Delete Ingredient</button>
                    </p>`
                )
            }
        }
    }
}

$('#add-new-recipe').click(() => {
    DOMManager.createRecipe($('#new-recipe-name').val())
    $('#new-recipe-name').val('');
});

DOMManager.getAllRecipes();