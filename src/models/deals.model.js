  import mongoose, {Schema, model} from "mongoose";


  const dealSchema = new Schema({
      user: {
          type: mongoose.Types.ObjectId,
          ref: 'User',
          required: true,
      },
      discount: {
          type: Number,
          required: true,
          min: [0, 'Discount cannot be negative'],
          max: [100, 'Discount cannot exceed 100']
      },
      startDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function(value) {
          return value >= new Date();
        },
        message: "Start date cannot be in the past"
      }
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function(value) {
          if (!value) return false;

          const start = this.startDate || new Date();

          // endDate must be after startDate
          if (value <= start) return false;

          // max 1 year duration
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          return value - start <= oneYear;
        },
        message: "End date must be after start date and within 1 year"
      }
    },
      product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
          unique: true
      }
  },{timestamps: true});

  dealSchema.index({orduct: 1})

  const Deal =  model("Deal", dealSchema)

  export { Deal }