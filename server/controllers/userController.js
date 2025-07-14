// API controller function to manage clerk user with Database
import { Webhook } from "svix";
import userModel from "../models/userModel.js";
//http://localhost:4000/api/user/webhooks

const clerkWebhooks = async (req, res) => {
  try {
    // Use the raw body for svix verification
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // const payload = req.body; // Buffer

    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });
    // const evt = whook.verify(payload, headers);
    // const { data, type } = evt;
    // const headers = {
    //   "svix-id": req.headers["svix-id"],
    //   "svix-timestamp": req.headers["svix-timestamp"],
    //   "svix-signature": req.headers["svix-signature"],
    // };
    // const evt = whook.verify(payload, headers);
    // const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };
        await userModel.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        res.json({});
        break;
      }
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
