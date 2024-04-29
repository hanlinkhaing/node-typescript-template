import {
	ICustomer,
	ICustomerRegiser,
	IAuthCustomer,
	ICustomerUpdateData,
	ICustomerUpdate
} from '../interfaces/customer-interfaces'
import { createMapper, Mapper, createMap, forMember, mapFrom } from '@automapper/core'
import { pojos, PojosMetadataMap } from '@automapper/pojos'

PojosMetadataMap.create<ICustomer>('ICustomer')
PojosMetadataMap.create<ICustomerRegiser>('ICustomerRegiser')
PojosMetadataMap.create<IAuthCustomer>('IAuthCustomer')
PojosMetadataMap.create<ICustomerUpdateData>('ICustomerUpdate')
PojosMetadataMap.create<ICustomerUpdate>('ICustomerUpdate')

const create = () => createMapper({ strategyInitializer: pojos() })

export function updateDataToCustomerUpdateMapper(): Mapper {
	const mapper = create()
	createMap<ICustomerUpdateData, ICustomerUpdate>(
		mapper,
		'ICustomerUpdateData',
		'ICustomerUpdate',
		forMember(
			d => d.fullname,
			mapFrom(s => s.txtname)
		),
		forMember(
			d => d.phone,
			mapFrom(s => {
				return s.txtphone.trim() + (s.txtphone2 ? `;${s.txtphone2.trim()}` : '')
			})
		)
	)
	return mapper
}

export function customerToAuthMapper(): Mapper {
	const mapper = create()
	createMap<ICustomer, IAuthCustomer>(
		mapper,
		'ICustomer',
		'IAuthCustomer',
		forMember(
			d => d.id,
			mapFrom(s => s.customerId)
		),
		forMember(
			d => d.username,
			mapFrom(s => s.user)
		),
		forMember(
			d => d.phone,
			mapFrom(s => s.phone)
		),
		forMember(
			d => d.fullname,
			mapFrom(s => s.fullname)
		),
		forMember(
			d => d.loginCount,
			mapFrom(s => s.login_count)
		),
		forMember(
			d => d.popupCount,
			mapFrom(s => s.popup_count)
		),
		forMember(
			d => d.bankList,
			mapFrom(s => s.bank_list)
		),
		forMember(
			d => d.userLastUpdate,
			mapFrom(s => s.user_last_update)
		)
	)
	return mapper
}

export function customerRegisterToCustomerMapper(): Mapper {
	const mapper = create()
	createMap<ICustomerRegiser, ICustomer>(
		mapper,
		'ICustomerRegister',
		'ICustomer',
		forMember(
			d => d.aff_code,
			mapFrom(s => s.aff_id)
		),
		forMember(
			d => d.user,
			mapFrom(s => s.txtuser.trim())
		),
		forMember(
			d => d.phone,
			mapFrom(s => {
				return s.txtphone.trim() + (s.txtphone2 ? `;${s.txtphone2.trim()}` : '')
			})
		),
		forMember(
			d => d.fullname,
			mapFrom(s => s.txtname.trim())
		),
		forMember(
			d => d.email,
			mapFrom(s => s.txtuser.trim())
		),
		forMember(
			d => d.password,
			mapFrom(s => s.txtpass)
		),
		forMember(
			d => d.str,
			mapFrom(() => '')
		),
		forMember(
			d => d.date_created,
			mapFrom(() => new Date())
		),
		forMember(
			d => d.last_login,
			mapFrom(() => new Date())
		),
		forMember(
			d => d.created_on_mobi_desktop,
			mapFrom(() => 'MOBI')
		),
		forMember(
			d => d.reset_key,
			mapFrom(() => '')
		),
		forMember(
			d => d.suspect_note,
			mapFrom(() => '')
		),
		forMember(
			d => d.create_by,
			mapFrom(() => '')
		),
		forMember(
			d => d.warning_note,
			mapFrom(() => '')
		),
		forMember(
			d => d.token_login,
			mapFrom(() => '')
		)
	)
	return mapper
}
