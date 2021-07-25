const { REFUSED } = require("dns");
const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
    
    function read(req, res){
    res.json( { data: res.locals.order } )
    };
    
    function list(req, res, next){
    res.json({ data: orders })
    };
    
    function create(req, res, next){
       const data = res.locals.order;
       const newId = nextId();
       let newOrder;
       if (data && newId){
          newOrder = data;
          newOrder.id = newId;
       }
       if (newOrder) {
          orders.push(newOrder);
       }
       if (orders.find((order) => order.id === newId)){
          res.status(201).json({"data": newOrder});
       }
    }

    function update(req, res, next){
       const orderId = req.params.orderId;
       const oldData = orders.find((order) => orderId === order.id)
       const newData = res.locals.order;
      if ((oldData) && (oldData !== newData)) {
         for (let i = 0; i < orders.length; i++){
            if (orders[i].id === orderId){
               orders[i] = newData;
               orders[i].id = orderId;
            res.json({data: orders[i]})
         }
         }
      }
   }

   function destroy(req, res){
      const orderId = res.locals.order.id;
      const index = orders.findIndex((order) => order.id === Number(orderId))
      orders.splice(index, 1);
      res.sendStatus(204);
   }
//-------------------------------Validation functions below -----------------------------------


   function orderExists(req, res, next){
      const orderId = req.params.orderId;
      const foundOrder = orders.find((order) => order.id === orderId);
      if (foundOrder){
         res.locals.order = foundOrder;
         next();
      };
      if (!foundOrder) {
         return next({ status: 404, message: ` orderId ${orderId} doesn't exist in orders.` });   
      };
  };


  function orderExistsUpdate(req, res, next){
   const orderId = req.params.orderId;
   const order = req.body.data;
   const foundOrder = orders.find((order) => order.id === orderId);
   if (foundOrder){
      res.locals.order = order;
      next();
   };
   if (!foundOrder) {
      return next({ status: 404, message: ` orderId ${orderId} doesn't exist in orders.` });   
   };
};

    function deliverToTestUpdate(req, res, next){
       const data = res.locals.order;
       const deliverTo = data.deliverTo;
       if (!deliverTo) next({status: 400, message: 'needs deliverTo property'});
       if (deliverTo) {
          res.locals.order = data;
          next();
       }
    }

    function deliverToTest(req, res, next){
       const data = req.body.data;
       const deliverTo = data.deliverTo;
       if (!deliverTo) next({status: 400, message: 'needs deliverTo property'});
       if (deliverTo) {
          res.locals.order = data;
          next();
       }
    }

    function mobileNumberTest(req, res, next){
       const data = res.locals.order;
       const mobileNumber = data.mobileNumber;
       if (!mobileNumber) next({status: 400, message: 'needs mobileNumber'});
       res.locals.order = data;
       next();
    }
    
    function dishExistsTest(req, res, next){
       const data = res.locals.order;
       const dishes = data.dishes;
       if (!dishes) next({status: 400, message: 'Order must include a dish'});
       if (!Array.isArray(dishes) || (dishes.length === 0)) {
          next({status: 400, message: 'Order must include at least one dish.'})
       }
       res.locals.order = data;
       next();
    }

    function dishQuantityTest(req, res, next){
       const data = res.locals.order;
       const dishes = data.dishes;
      for (let i = 0; i < dishes.length; i++){
         if (!dishes[i].quantity) next({status: 400, message: `Dish ${i} must have quantity that is an integer greater than 0`})
      }
       for (let i = 0; i < dishes.length; i++){
          const integer = Number.isInteger(dishes[i].quantity);
          const length = dishes[i].quantity
            if ( !integer || (length <= 0)){
               next({status: 400, message: `Dish ${i} must have quantity that is an integer greater than 0`})
            }
       }
    res.locals.order = data;
    next();
   }

  function statusTest(req, res, next){
     const data  = res.locals.order
     const status = data.status;
   if ((status !== 'pending') && (status !== 'preparing') && (status !== 'out-for-delivery')) {
      next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"});
   }
   if (status === 'delivered'){
      next({status: 404, message: 'A delivered order cannot be changed'})
   }
   res.locals.order = data;
   next();
  }

  function deleteStatusTest(req, res, next){
     const data = res.locals.order;
     const status = data.status;
     if (status !== 'pending'){
        next({status: 400, message: 'An order cannot be deleted unless it is pending'});
     }
     res.locals.order = data;
     next();
  }

  function idTest(req, res, next){
      const data = res.locals.order;
      const bodyId = data.id;
      const paramsId = req.params.orderId;
      if ((bodyId) && (bodyId !== paramsId)){
         next({status: 400, message: `Order id does not match route id. Order: ${bodyId}, Route: ${paramsId}.`})
      }
      if ((!bodyId) || (bodyId === paramsId)){
      res.locals.order = data;
      next();
      }
  }

    module.exports = {
       list,
       read: [orderExists, read],
       create: [deliverToTest, mobileNumberTest, dishExistsTest, dishQuantityTest, create],
       update: [orderExistsUpdate, idTest, deliverToTestUpdate, mobileNumberTest, dishExistsTest, dishQuantityTest, statusTest, update],
       delete: [orderExists, deleteStatusTest, destroy]
    }

