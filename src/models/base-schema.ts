import { Document, Schema, SchemaDefinition, SchemaOptions, ObjectId, ResolveSchemaOptions } from 'mongoose'

const baseDefination: SchemaDefinition = {
	deletedAt: { type: Schema.Types.Number, default: 0 }
}

const baseOptions: SchemaOptions = {
	timestamps: true,
	strict: false,
	toJSON: {
				transform(doc: Document, ret: Record<string, any>) {
					ret.id = ret._id
					delete ret._id
					delete ret.__v
				}
			}
}

export class BaseSchema<T> extends Schema<T> {
	constructor(schemaDefinition: SchemaDefinition, schemaOptions?: SchemaOptions | ResolveSchemaOptions<any>) {
		const defination = { ...schemaDefinition, ...baseDefination }
		const options = schemaOptions ? { ...baseOptions, ...schemaOptions } : baseOptions
		super(defination, options)

		this.statics.softDelete = async function (id: ObjectId | string) {
			return this.findByIdAndUpdate(id, { deletedAt: Date.now() })
		}
		this.statics.restore = async function (id: ObjectId | string) {
			return this.findByIdAndUpdate(id, { deletedAt: 0 })
		}
	}
}
