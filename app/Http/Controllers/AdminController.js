'use strict'

const Helpers = use('Helpers')
const User = use('App/Model/User')
const Plant = use('App/Model/Plant')
const _ = require('lodash')


class AdminController {

  * index(request, response) {
    // console.log(request.authUser.attributes.admin);
    if (request.authUser.attributes.admin === true) {
      return response.json({ success: true })
    } else {
      return { error: false }
    }
  }

  * plantStore(request, response) {
    const plant = request.all();
    const admin = request.authUser.attributes.admin;
    if (admin) {
      const newPlant = yield Plant.create(plant);
      return response.json(newPlant.toJSON());
    } else {
      return response.json({error: 'Not An Admin'})
    }
  }

  * plantIndex (request, response) {
    const admin = request.authUser.attributes.admin;
    if (admin) {
      let plants = yield Plant.all();
      yield response.json(plants.toJSON())
    }
  }

  * plantShow (request, response) {
    const admin = request.authUser.attributes.admin;
    if (admin) {
      let plant = yield Plant.findBy('id', request.param('id'));
      yield response.json(plant.toJSON());
    }
  }

  * updatePlant (request, response) {
    let plant = yield Plant.findBy('id', request.param('id'));
    console.log(plant)
    const admin = request.authUser.attributes.admin;
    if (admin) {
      console.log(plant)
      let input = request.all()
      plant = _.merge(plant, input);
      yield plant.save()
      response.json(plant.toJSON());
    }
  }

  * deletePlant (request, response) {
    let plant = yield Plant.findBy('id', request.param('id'));
    const admin = request.authUser.attributes.admin;
    if (admin) {
      yield plant.delete()
      response.json({success: true})
    } else {
      response.json({error: true})
    }

  }

  * updateImage (request, response) {
    const image = request.file('image', {
      maxSize: '2mb',
      allowedExtensions: ['jpg', 'png', 'jpeg']
    })

    const plantId = request.param('id')
    const plant = yield Plant.findOrFail(plantId)
    const fileName = `${plantId}.${image.extension()}`

    yield image.move(Helpers.storagePath(), fileName)
    if (!image.moved()) {
      response.badRequest(image.errors())
      return
    }
    plant.image = image.uploadPath()
    yield plant.save()
    response.ok('Image Updated Successfully')
  }

}

module.exports = AdminController
