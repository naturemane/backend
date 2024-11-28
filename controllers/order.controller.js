import nodemailer from 'nodemailer'
import orderModel from '../models/orderSchema.js'
import productModel from '../models/productSchema.js'

const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 // Get page from query, default to 1
    const limit = parseInt(req.query.limit) || 8 // Get limit from query, default to 8
    const skip = (page - 1) * limit // Calculate the number of documents to skip

    // Fetch the orders with pagination
    const orders = await orderModel.find().skip(skip).limit(limit)
    const totalOrders = await orderModel.countDocuments() // Get the total count of orders

    res.status(200).json({
      orders,
      totalPages: Math.ceil(totalOrders / limit), // Calculate total pages
      currentPage: page
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getOrderById = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: 'ID not found !' })
    }
    const response = await orderModel.findById(req.params.id)
    res.status(200).json(response)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const createOrder = async (req, res) => {
  try {
    // Create the order first
    const response = await orderModel.create({
      ...req.body,
      orderId: (await orderModel.find()).length + 1
    })

    // Loop through each item in the order
    for (const item of response.order) {
      await productModel.findByIdAndUpdate(item._id, {
        $inc: { quantity: -item.userQte, soldCount: item.userQte }
      })
    }

    // Send the response back
    res.status(201).json(response)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateOrder = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const { formData } = req.body
  try {
    if (!id) {
      return res.status(400).json({ message: 'Id not found' })
    }
    if (!status && !formData) {
      return res.status(400).json({ message: 'No status or data provided!' })
    }
    if (status) {
      await orderModel.findByIdAndUpdate(id, { status: status })

      return res.status(200).json({ message: 'Status updated' })
    }
    if (formData) {
      await orderModel.findByIdAndUpdate(id, formData)
      return res.status(200).json({ message: 'Data updated' })
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendStatusMail = async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: 'Certaines données sont manquantes !' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  let htmlTemplate

  if (message.status === 'Livré') {
    // Template for delivered orders
    htmlTemplate = `
      <h2 style="color: #2C3E50;">Bonjour ${name},</h2>
      <p style="font-size: 16px; color: #34495E;">
        Votre commande Numéro #${
          message.orderId
        } a été <strong style="color: #27AE60;">Livré</strong> avec succès ! Nous vous remercions pour votre achat et votre confiance.
      </p> 
       <h2 style="font-size: 14px; color: #34495E;">Détails de la Commande :</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Nom du Produit</th>
        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Quantité</th>
        <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${message.order
        .map(
          item => `
        <tr>
          <td style="border-bottom: 1px solid #ddd; padding: 8px; ">${
            item.name
          }</td>
          <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
            item.userQte
          }</td>
          <td style="border-bottom: 1px solid #ddd; padding: 8px; color: #00FF00;">${
            item.price * item.userQte
          } MAD</td>
        </tr>
        `
        )
        .join('')}
    </tbody>
  </table>  
  <br />
  <p style="font-size: 14px; color: #34495E;">Cordialement,</p>
  <p style="font-size: 14px; color: #2C3E50;">L'équipe de NatureMane.</p>
    `
  } else if (message.status === 'Expédié') {
    // Template for canceled orders
    htmlTemplate = `
      <h2 style="color: #2C3E50;">Bonjour ${name},</h2>
      <p style="font-size: 16px; color: #34495E;">
        Votre commande Numéro #${
          message.orderId
        } a été <strong style="color: #27AE60;">Expédié</strong> avec succès !
      </p> 
       <h2 style="font-size: 14px; color: #34495E;">Détails de la Commande :</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Nom du Produit</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Quantité</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${message.order
            .map(
              item => `
            <tr>
              <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
                item.name
              }</td>
              <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
                item.userQte
              }</td>
              <td style="border-bottom: 1px solid #ddd; padding: 8px; color: #00FF00;">${
                item.price * item.userQte
              } MAD</td>
            </tr>
            `
            )
            .join('')}
        </tbody>
      </table>  
      <br />
      <p style="font-size: 14px; color: #34495E;">
        <strong>Livreur :</strong> ${message.livName}
      </p>
      <p style="font-size: 14px; color: #34495E;">
        <strong>Numéro de téléphone :</strong> ${message.livNumber}
      </p>
      <p style="font-size: 14px; color: #34495E;">Cordialement,</p>
      <p style="font-size: 14px; color: #2C3E50;">L'équipe de NatureMane.</p>
    `
  } else if(message.status === 'Annulé'){
    htmlTemplate = `
      <h2 style="color: #2C3E50;">Bonjour ${name},</h2>
       <p style="font-size: 16px; color: #34495E;">
        Suite à votre demande, nous vous confirmons que votre commande a bien été <span style="color: #ff0000;">Annulé</span>. <br />
      </p> 
      <p style="font-size: 16px; color: #34495E;">
        Si vous n'êtes pas à l'origine de cette demande d'annulation merci de nous contacter afin de résoudre le problème. <br />
      </p>
      <p style="font-size: 16px; color: #2C3E50;">Contact: support@naturemane.com </p>
      <p style="font-size: 14px; color: #2C3E50;">Cordialement,</p>
      <p style="font-size: 14px; color: #2C3E50;">L'équipe de NatureMane.</p>
    `
  }else{
    return ;
  }

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: `Votre Commande Numéro #${message.orderId} a été ${message.status}`,
    html: htmlTemplate
  }

  try {
    await transporter.sendMail(mailOptions)
    res
      .status(200)
      .json({ success: true, message: 'Email envoyé avec succès !' })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Échec de l'envoi de l'email", error })
  }
}

const dashboardData = async (req, res) => {
  try {
    let revenue = 0
    let deliveredCount = 0
    let pendingCount = 0
    let returnedCount = 0

    // Category-specific counters
    let visageCategoryCount = 0
    let packsCategoryCount = 0
    let peauCategoryCount = 0
    let cheveuxCategoryCount = 0

    const orders = await orderModel.find()

    if (!orders) {
      res.status(400).json({ message: 'Order not found !' })
    }

    orders.forEach(order => {
      if (order.status === 'Livré') {
        revenue += parseFloat(order.total)
        deliveredCount++

        // Increment category counts based on order details
        order.order.forEach(item => {
          if (item.category === 'visage') {
            visageCategoryCount++
          } else if (item.category === 'packs') {
            packsCategoryCount++
          } else if (item.category === 'peau') {
            peauCategoryCount++
          } else if (item.category === 'cheuveux') {
            cheveuxCategoryCount++
          }
        })
      } else if (order.status === 'En Attente') {
        pendingCount++
      } else if (order.status === 'Retour') {
        returnedCount++
      }
    })

    res.status(200).json({
      revenue,
      deliveredCount,
      pendingCount,
      returnedCount,
      categories: {
        visageCategoryCount,
        packsCategoryCount,
        peauCategoryCount,
        cheveuxCategoryCount
      }
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getDailyChartData = async (req, res) => {
  try {
    const now = new Date()
    const today = now.getDay() // Get day of the week (0 for Sunday, 1 for Monday, etc.)

    // Calculate days to subtract to get to Monday
    const daysToDec = (today + 6) % 7

    // Adjust startDate to Monday of the current week
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - daysToDec)
    startDate.setHours(0, 0, 0, 0) // Reset time to the start of the day

    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6) // End date is one week later

    const daysLabels = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ]

    // Aggregate orders by day of the week
    const orders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: { $in: ['Livré', 'Retour'] }
        }
      },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          status: 1
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: '$dayOfWeek',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.dayOfWeek',
          delivered: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'Livré'] }, '$count', 0] }
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'Retour'] }, '$count', 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    // Prepare data for response
    const data = daysLabels.map((label, index) => {
      let delivered = 0
      let returned = 0

      const dayIndex = (index + 2) % 7 // Convert to MongoDB day index (1 for Monday, 2 for Tuesday, etc.)
      const orderData = orders.find(order => order._id === dayIndex)

      if (orderData) {
        delivered = orderData.delivered
        returned = orderData.returned
      }

      return {
        label,
        delivered,
        returned
      }
    })

    res.json(data)
  } catch (error) {
    res.status(500).json(error)
  }
}

const getMonthlyChartData = async (req, res) => {
  try {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), 0, 1) // Start of the year
    const labels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]

    const orders = await orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['Livré', 'Retour'] }
        }
      },
      {
        $group: {
          _id: {
            status: '$status',
            month: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          delivered: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'Livré'] }, '$count', 0]
            }
          },
          returned: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'Retour'] }, '$count', 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])

    const data = labels.map((label, index) => {
      let delivered = 0
      let returned = 0
      const month = String(index + 1).padStart(2, '0')
      const yearMonth = `${now.getFullYear()}-${month}`

      const orderData = orders.find(order => order._id === yearMonth)
      if (orderData) {
        delivered = orderData.delivered
        returned = orderData.returned
      }

      return {
        label,
        delivered,
        returned
      }
    })

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params
    await orderModel.findByIdAndUpdate(id, { status: 'Annulé' })
    res.status(200).json({
      message: 'Commande Annulé'
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendMail = async (req, res) => {
  const { name, email, subject, message } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  const mailOptions = {
    from: email,
    to: process.env.SMTP_EMAIL,
    subject: subject,
    text: `You have a new Order from ${name} \n \n ${message}`
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ success: true, message: 'Email sent successfully!' })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to send email', error })
  }
}

const sendUserMail = async (req, res) => {
  const { name, email, message } = req.body

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  })

  // Parse the order details from the message
  const { order, total, orderId } = message

  // Get the current date
  const orderDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const adjustedTotal = total > 270 ? total : Number(total) + 30
  const deliveryFee = total > 270 ? 'Livraison Gratuite' : '30 MAD'

  // Generate the HTML template for the receipt
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #4CAF50;">NatureMane</h1>
      <p>Merci pour votre commande, ${name}!</p>
      <p><strong>Date de la commande:</strong> ${orderDate}</p>
      <hr>
      <h2>Informations de la Commande :</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Adresse:</strong> ${message.adress1}, ${message.adress2}, ${
    message.city
  }</p>
      <p><strong>Téléphone:</strong> ${message.phoneNum}</p>
      <p><strong>Numéro de la commande:</strong> ${orderId}</p>
      <p style="color: #FF0000;"><strong>Remarque :</strong> Si vous remarquez une erreur dans votre commande, veuillez nous contacter à l'adresse suivante : <a href="mailto:support@newmane.com">support@newmane.com</a></p>
      <hr>
      <h2>Détails de la Commande :</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Nom du Produit</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Quantité</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order
            .map(
              item => `
            <tr>
              <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
                item.name
              }</td>
              <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
                item.userQte
              }</td>
              <td style="border-bottom: 1px solid #ddd; padding: 8px;">${
                item.price * item.userQte
              } MAD</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <p><strong>Frais de livraison :</strong> ${deliveryFee}</p>
      <h3>Total: <span style="color: #4CAF50;">${adjustedTotal} MAD</span></h3>
      <hr>
      <p>Merci de nous avoir fait confiance pour votre achat !</p>
    </div>
  `

  const mailOptions = {
    from: 'newMane@gmail.com',
    to: email,
    subject: `Confirmation de la Commande Numéro: ${orderId}!`,
    html: htmlTemplate
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ success: true, message: 'Email sent successfully!' })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Failed to send email', error })
  }
}

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  dashboardData,
  deleteOrder,
  getDailyChartData,
  getMonthlyChartData,
  sendMail,
  sendUserMail,
  sendStatusMail
}
