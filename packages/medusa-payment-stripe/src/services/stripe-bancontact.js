import StripeBase from "../helpers/stripe-base"

class BancontactProviderService extends StripeBase {
  static identifier = "stripe-bancontact"

  constructor({ stripeProviderService, manager }, options) {
    super({ stripeProviderService, manager }, options)
  }

  get paymentIntentOptions() {
    return {
      payment_method_types: ["bancontact"],
      capture_method: "automatic",
    }
  }
}

export default BancontactProviderService
