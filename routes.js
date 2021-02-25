// import { cloudinary } from './config/cloudinary';

const v2 = require('./config/cloudinary');

const express = require('express');
const passport = require('passport');

const User = require('./models/user');
const Restaurant = require('./models/restaurant');
const Product = require('./models/product');
const Basket = require('./models/basket');
const {
  format,
  formatDistance,
  formatRelative,
  subDays,
  getHours,
  getMinutes,
} = require('date-fns');

const router = express.Router();

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

router.get('/', function (req, res, next) {
  console.log(getHours(new Date()), getMinutes(new Date()));
  User.find()
    .sort({
      createdAt: 'descending',
    })
    .exec(function (err, users) {
      if (err) {
        return next(err);
      }

      Product.find()
        .populate('restaurantId')
        .exec(function (err, products) {
          if (err) {
            return next();
          }
          Restaurant.find().exec(function (err, restaurants) {
            if (err) {
              return next();
            }
            res.render('index', {
              users: users,
              products: products,
              restaurants: restaurants,
            });
          });
        });
    });
});

router.get('/api/restaurants', async function (req, res) {
  try {
    const { restaurant } = req.query;
    console.log(restaurant);
    const restaurants = await Restaurant.find({
      name: { $regex: new RegExp(restaurant, 'i') },
    });
    return res.status(200).send(restaurants);
  } catch (e) {
    console.log(e);
  }
});

router.post('/users/:id', function (req, res) {
  // const usr = req.params.id;
  User.findByIdAndDelete(req.params.id).exec(function (err, user) {
    if (user) {
      return res.redirect('/tables-page');
    }
  });
});

router.post('/restaurant/:id', function (req, res) {
  Restaurant.findByIdAndDelete(req.params.id).exec(function (err, rest) {
    return res.redirect('/tables-page');
  });
});

router.post('/food/:id', function (req, res) {
  Product.findByIdAndDelete(req.params.id).exec(function (err, rest) {
    return res.redirect('/');
  });
});

router.post('/api/food', async function (req, res) {
  const { name, file, price, restaurantId, type } = req.body;

  const restaurant = await Restaurant.findOne({ name: restaurantId });

  const data = await v2.uploader.upload(file, {});
  const imageOrientation = data.width > data.height ? 'vertical' : 'horizontal';

  const food = new Product({
    name,
    price,
    restaurantId: restaurant.id,
    type,
    imageUrl: data.secure_url,
    imageOrientation,
  });

  await food.save();

  return res.status(200).send('food has been created');
});

router.patch('/api/food/:id', async function (req, res) {
  try {
    const { id } = req.params;
    const { field, value } = req.body;
    await Product.findByIdAndUpdate(id, { [field]: value });
    return res.status(200).send('PATCH: OK!');
  } catch (e) {
    console.log(e);
  }
});

router.delete('/api/food/:id', async function (req, res) {
  await Product.findByIdAndDelete(req.params.id);
  return res.status(200).send('success delete');
});

router.get('/api/food/:id', async function (req, res) {
  const food = await Product.findById(req.params.id).populate('restaurantId');
  return res.status(200).send(food);
});

router.get('/api/restaurants/all-restaurants', async function (req, res) {
  const restaurant = await Restaurant.find().populate('user');
  return res.status(200).send(restaurant);
});

router.get('/product', function (req, res, next) {
  const productId = req.query.id;
  Product.findById(productId)
    .populate('restaurantId')
    .exec(function (err, product) {
      // console.log(product)
      Restaurant.find().exec(function (err, rest) {
        // res.set('Content-Type', 'text/html')
        return res.render('pages/product-page', {
          product: product,
          restaurants: rest,
        });
      });
    });
});

router.get('/about-page', function (req, res) {
  Restaurant.find().exec(function (err, rest) {
    return res.render('pages/about-page', { restaurants: rest });
  });
});

router.get('/basket-page', ensureAuthenticated, function (req, res) {
  // console.log(req.user.id)
  Basket.find({ userId: req.user.id })
    .populate(['userId', 'productId'])
    .exec(function (err, basket) {
      // console.log(basket);
      let finalPrice = 0;
      const finalBasket = [];

      for (let product = 0; product < basket.length; product++) {
        if (getHours(basket[product].orderTime) + 3 >= getHours(new Date())) {
          finalBasket.push(basket[product]);
        }
      }
      basket.forEach(function (bskt) {
        finalPrice += +bskt.productId.price;
      });

      console.log(finalPrice);
      Restaurant.find().exec(function (err, restaurant) {
        return res.render('pages/basket-page', {
          basket: finalBasket,
          finalPrice: finalPrice,
          restaurants: restaurant,
          getMinutes: getMinutes,
          getHours: getHours,
        });
      });
    });
});

router.post('/checkout', ensureAuthenticated, function (req, res, next) {
  Basket.deleteMany({ userId: req.user.id }).exec(function (_, __) {
    return res.redirect('/basket-page');
  });
});

router.get('/food-page', function (req, res) {
  const finalProducts = [];
  Product.find({ type: 'food' })
    .populate('restaurantId')
    .exec(function (err, products) {
      // console.log(products);
      Restaurant.find()
        .populate('user')
        .exec(function (err, rest) {
          for (let product = 0; product < products.length; product++) {
            if (
              req.user &&
              req.user.role === 3 &&
              products[product].restaurantId.user &&
              String(products[product].restaurantId.user) ===
                String(req.user._id)
            ) {
              finalProducts.push(products[product]);
            }
          }
          console.log(products);
          if (req.user && req.user.role === 3) {
            return res.render('pages/food-page', {
              products: finalProducts,
              restaurants: rest,
            });
          }
          return res.render('pages/food-page', {
            products: products,
            restaurants: rest,
          });
        });
    });
});

router.get('/drink-page', function (req, res) {
  const finalProducts = [];
  Product.find({ type: 'coffee' })
    .populate('restaurantId')
    .exec(function (err, products) {
      Restaurant.find().exec(function (err, rest) {
        for (let product = 0; product < products.length; product++) {
          if (
            req.user &&
            req.user.role === 3 &&
            products[product].restaurantId.user &&
            String(products[product].restaurantId.user) === String(req.user._id)
          ) {
            finalProducts.push(products[product]);
          }
        }
        if (req.user && req.user.role === 3) {
          return res.render('pages/coffee-page', {
            products: finalProducts,
            restaurants: rest,
          });
        }
        return res.render('pages/coffee-page', {
          products: products,
          restaurants: rest,
        });
      });
    });
});

router.get('/bakery-page', function (req, res) {
  const finalProducts = [];
  Product.find({ type: 'bakery' })
    .populate('restaurantId')
    .exec(function (err, products) {
      Restaurant.find().exec(function (err, rest) {
        for (let product = 0; product < products.length; product++) {
          if (
            req.user &&
            req.user.role === 3 &&
            products[product].restaurantId.user &&
            String(products[product].restaurantId.user) === String(req.user._id)
          ) {
            finalProducts.push(products[product]);
          }
        }
        if (req.user && req.user.role === 3) {
          return res.render('pages/bakery-page', {
            products: finalProducts,
            restaurants: rest,
          });
        }
        return res.render('pages/bakery-page', {
          products: products,
          restaurants: rest,
        });
      });
    });
});

router.get('/tables-page', function (req, res) {
  User.find().exec(function (err, user) {
    Restaurant.find().exec(function (err, restaurant) {
      return res.render('pages/data-page', {
        users: user,
        restaurants: restaurant,
      });
    });
  });
});

router.get('/add-restaurant-page', function (req, res) {
  Restaurant.find().exec(function (err, restaurant) {
    return res.render('pages/add-restaurant', { restaurants: restaurant });
  });
});

router.post('/add-restaurant', function (req, res) {
  const restaurantName = req.body.restaurant;

  const restaurant = new Restaurant({ name: restaurantName });
  restaurant.save();

  return res.redirect('/');
});

router.post(
  '/signup',
  function (req, res, next) {
    const username = req.body.user;
    const password = req.body.pass;
    const email = req.body.email;

    let restaurant;

    if (req.body.restaurantname) {
      restaurant = req.body.restaurantname;
      // console.log(restaurant)
    }

    User.findOne(
      {
        username: username,
      },
      function (err, user) {
        if (err) {
          return next(err);
        }
        if (user) {
          req.flash('error', 'User already exists');
          return res.redirect('/signup');
        }

        const newUser = new User({
          username: username,
          password: password,
          email: email,
          role: restaurant ? 3 : 1,
        });
        newUser.save(function (err, usr) {
          if (err) {
            console.log(err);
          }
          console.log(usr);
          Restaurant.findByIdAndUpdate(restaurant, { user: usr._id }).exec();
          return res.redirect('/');
        });
      },
    );
  },
  passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true,
  }),
);

router.get('/users/:username', function (req, res, next) {
  User.findOne(
    {
      username: req.params.username,
    },
    function (err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(404).send('404: File not found!');
      }
      res.render('profile', {
        user: user,
      });
    },
  );
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post(
  '/login',
  passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true,
  }),
  function (req, res) {
    console.log(res.username, res.password);
  },
);

router.post('/add-food', function (req, res, next) {
  const foodName = req.body.foodname;
  const foodPrice = req.body.foodprice;
  const imageUrl = req.body.url;
  const foodType = req.body.type;
  const restaurantId = req.body.restaurant;

  Product.findOne(
    {
      name: foodName,
    },
    function (err, product) {
      if (err) {
        return next(err);
      }
      if (product) {
        req.flash('error', 'Product already exists');
        return res.redirect('/');
      }
      if (req.user && req.user.role === 3) {
        Restaurant.findOne({ user: req.user._id }).exec(function (err, rest) {
          const newProduct = new Product({
            name: foodName,
            price: foodPrice,
            restaurantId: rest.id,
            imageUrl: imageUrl,
            type: foodType,
          });

          newProduct.save(next);
        });

        return res.redirect('/');
      }
    },
  );
});

router.post('/edit-food', function (req, res) {
  const foodId = req.body.foodId;
  console.log(req.query.id);
  const foodName = req.body.foodname;
  const foodPrice = req.body.foodprice;
  const imageUrl = req.body.url;
  const foodType = req.body.type;
  const restaurantId = req.body.restaurant;

  Product.updateOne(
    { id: foodId },
    {
      name: foodName,
      price: foodPrice,
      imageUrl: imageUrl,
      type: foodType,
      restaurantId: restaurantId,
    },
  ).exec(function (err, product) {
    return res.redirect('/' + foodType + '-page');
  });
});

router.get('/get-food', function (req, res, next) {
  Product.find()
    .populate('restaurantId')
    .exec(function (err, product) {
      if (err) {
        return next(err);
      }
      return res.send(product);
    });
});

router.post('/add-restaurant', function (req, res, next) {
  const restaurantName = req.body.name;
  // console.log(restaurant);
  console.log(req.body);
  Restaurant.findOne(
    {
      name: restaurantName,
    },
    function (err, restaurant) {
      if (err) {
        return next(err);
      }
      if (restaurant) {
        req.flash('error', 'Restaurant already exists');
        return res.redirect('/');
      }

      const newRestaurant = new Restaurant({
        name: restaurantName,
      });
      newRestaurant.save(next);
      return res.redirect('/');
    },
  );
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

router.get('/edit', ensureAuthenticated, function (req, res) {
  res.render('edit');
});

router.get('', function (req, res) {});

router.post('/add-to-basket', ensureAuthenticated, function (req, res, next) {
  const userId = req.query.user;
  const productId = req.query.product;

  console.log(userId, productId);

  const newBasketElement = new Basket({
    userId: userId,
    productId: productId,
    orderTime: new Date(),
  });
  newBasketElement.save(next);
  return res.redirect('/basket-page');
});

router.post('/edit', ensureAuthenticated, function (req, res, next) {
  req.user.displayName = req.body.displayname;
  req.user.bio = req.body.bio;
  req.user.save(function (err) {
    if (err) {
      next(err);
      return;
    }
    req.flash('info', 'Profile updated!');
    res.redirect('/edit');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('info', 'You must be logged in to see this page.');
    res.redirect('/');
  }
}

module.exports = router;
