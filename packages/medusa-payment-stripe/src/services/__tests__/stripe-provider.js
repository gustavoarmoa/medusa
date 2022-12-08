import StripeProviderService from "../stripe-provider"
import { CustomerServiceMock } from "../../__mocks__/customer"
import { carts } from "../../__mocks__/cart"
import { TotalsServiceMock } from "../../__mocks__/totals"

const RegionServiceMock = {
  withTransaction: function () {
    return this
  },
  retrieve: jest.fn().mockReturnValue(Promise.resolve({})),
}

describe("StripeProviderService", () => {
  describe("createPayment", () => {
    let result
    const stripeProviderService = new StripeProviderService(
      {
        customerService: CustomerServiceMock,
        regionService: RegionServiceMock,
        totalsService: TotalsServiceMock,
      },
      {
        api_key: "test"
      }
    )

    beforeEach(async () => {
      jest.clearAllMocks()
    })

    it("returns created stripe payment intent for cart with existing customer", async () => {
      const cart = carts.frCart
      const context = {
        cart,
        amount: cart.total,
        currency_code: cart.region?.currency_code,
        collected_data: cart.customer?.metadata,
      }
      Object.assign(context, cart)

      result = await stripeProviderService.createPayment(context)
      expect(result).toEqual({
        session_data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          description: undefined,
          amount: 100,
        },
        collected_data: {
          customer: {
            stripe_id: "cus_lebron"
          }
        }
      })
    })

    it("returns created stripe payment intent for cart with no customer", async () => {
      const cart = carts.frCart
      const context = {
        cart,
        amount: cart.total,
        currency_code: cart.region?.currency_code,
        collected_data: cart.customer?.metadata,
      }
      Object.assign(context, cart)

      context.cart.context.payment_description = 'some description'

      result = await stripeProviderService.createPayment(context)
      expect(result).toEqual({
        session_data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          description: 'some description',
          amount: 100,
        },
        collected_data: {
          customer: {
            stripe_id: "cus_lebron"
          }
        }
      })
    })

    it("returns created stripe payment intent for cart with no customer and the options default description", async () => {
      const localStripeProviderService = new StripeProviderService({
        customerService: CustomerServiceMock,
        regionService: RegionServiceMock,
        totalsService: TotalsServiceMock,
      },
      {
        api_key: "test",
        payment_description: "test options description"
      })

      const cart = carts.frCart
      const context = {
        cart,
        amount: cart.total,
        currency_code: cart.region?.currency_code,
        collected_data: cart.customer?.metadata,
      }
      Object.assign(context, cart)

      context.cart.context.payment_description = null

      result = await localStripeProviderService.createPayment(context)
      expect(result).toEqual({
        session_data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          description: "test options description",
          amount: 100,
        },
        collected_data: {
          customer: {
            stripe_id: "cus_lebron"
          }
        }
      })
    })
  })

  describe("retrievePayment", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.retrievePayment({
        payment_method: {
          data: {
            id: "pi_lebron",
          },
        },
      })
    })

    it("returns stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
      })
    })
  })

  describe("updatePayment", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.updatePayment(
        {
          id: "pi_lebron",
          amount: 800,
        },
        {
          total: 1000,
        }
      )
    })

    it("returns updated stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        amount: 1000,
      })
    })
  })

  describe("updatePaymentIntentCustomer", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {
          customerService: CustomerServiceMock,
          regionService: RegionServiceMock,
          totalsService: TotalsServiceMock,
        },
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.updatePaymentIntentCustomer(
        "pi_lebron",
        "cus_lebron_2"
      )
    })

    it("returns update stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron_2",
        amount: 1000,
      })
    })
  })

  describe("capturePayment", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {},
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.capturePayment({
        data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          amount: 1000,
        },
      })
    })

    it("returns captured stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        amount: 1000,
        status: "succeeded",
      })
    })
  })

  describe("refundPayment", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {},
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.refundPayment(
        {
          data: {
            id: "re_123",
            payment_intent: "pi_lebron",
            amount: 1000,
            status: "succeeded",
          },
        },
        1000
      )
    })

    it("returns refunded stripe payment intent", () => {
      expect(result).toEqual({
        id: "re_123",
        payment_intent: "pi_lebron",
        amount: 1000,
        status: "succeeded",
      })
    })
  })

  describe("cancelPayment", () => {
    let result
    beforeAll(async () => {
      jest.clearAllMocks()
      const stripeProviderService = new StripeProviderService(
        {},
        {
          api_key: "test",
        }
      )

      result = await stripeProviderService.cancelPayment({
        data: {
          id: "pi_lebron",
          customer: "cus_lebron",
          status: "cancelled",
        },
      })
    })

    it("returns cancelled stripe payment intent", () => {
      expect(result).toEqual({
        id: "pi_lebron",
        customer: "cus_lebron",
        status: "cancelled",
      })
    })
  })
})
