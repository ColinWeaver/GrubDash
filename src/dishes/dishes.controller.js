const path = require("path");
// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /dishes handlers needed to make the tests pass


function read(req, res){
res.json( { data: res.locals.dish } )
}

function list(req, res){
res.json({ data: dishes })
}

function create(req, res){
   const data = res.locals.dish;
   const newId = nextId();
   let newDish;
   if (newId) {
      newDish = data;
      newDish.id = newId;
}
   if (newDish) dishes.push(newDish);
   if (dishes.find((dish) => dish.id === newId)){
    res.status(201).json({data: newDish});
   }
}

function update(req, res){
   const updatedDish = res.locals.dish;
   const paramId = req.params.dishId;
   updatedDish.id = paramId;
   for (let i = 0; i < dishes.length; i++){
      if (dishes[i].id === paramId){
         dishes[i] = updatedDish;
      }
   }
   if (dishes.find((dish) => dish.id === paramId)){
      res.json({data: updatedDish})
   }
}


//--------------------------------Validation functions-----------------------

function dishExistsUpdate(req, res, next){
   const dishId = req.params.dishId;
   const dish = req.body.data;
   const foundDish = dishes.find((dish) => dish.id === dishId);
   if (foundDish){
      res.locals.dish = dish;
      next();
   }
   else {
      return next({ status: 404, message: 'dishId not found' })   
   }
}

function dishExists(req, res, next){
   const dishId = req.params.dishId;
   const foundDish = dishes.find((dish) => dish.id === dishId);
   if (foundDish){
      res.locals.dish = foundDish;
      next();
   }
   else {
      next({ status: 404, message: 'dishId not found' })   
   }
}

function nameTest(req, res, next){
   const dish = req.body.data;
   const name = dish.name;
   if (!name){
      next({status: 400, message: 'Dish must include a name'});
   }
   else {
      res.locals.dish = dish;
      next();
   }
}

function descriptionTest(req, res, next){
   const dish = res.locals.dish;
   const description = dish.description;
   if (!description){
      next({status: 400, message: 'Dish must include a description'});
   }
   else {
      res.locals.dish = dish;
      next();
   }
}

function priceTest(req, res, next){
   const dish = res.locals.dish;
   const price = dish.price;
   const integer = Number.isInteger(price);
   if (!price){
      next({status: 400, message: '	Dish must include a price'})
   }
   if (!integer || price <= 0){
      next({status: 400, message: 'Dish must have a price that is an integer greater than 0'})
   }
   else {
      res.locals.dish = dish;
      next();
   }
}

function image_urlTest(req, res, next){
   const dish = res.locals.dish;
   const image_url = dish.image_url;
   if (!image_url){
      next({status: 400, message: 'Dish must include a image_url'})
   }
   res.locals.dish = dish;
   next();
}

function idTest(req, res, next){
const dish = res.locals.dish;
const bodyId = dish.id;
const paramId = req.params.dishId;
if (!bodyId){
   res.locals.dish = dish;
   next();
}
if (bodyId !== paramId){
next({status: 400, message: `Dish id does not match route id. Dish: ${bodyId}, Route: ${paramId}`})
}
if (bodyId === paramId){
res.locals.dish = dish;
next();
}
}

function nameTestUpdate(req, res, next){
   const dish = res.locals.dish;
   const name = dish.name;
   if (!name){
      next({status: 400, message: 'Dish must include a name'});
   }
   else {
      res.locals.dish = dish;
      next();
   }
}

module.exports = {
   list,
   read: [dishExists, read],
   create: [nameTest, descriptionTest, priceTest, image_urlTest, create],
   update: [dishExistsUpdate, idTest, nameTestUpdate, descriptionTest, priceTest, image_urlTest, update]
}



