import { IUser, IUserRegiser, IAuthUser, IUserUpdateData, IUserUpdate } from '../interfaces/user-interfaces'
import { createMapper, Mapper, createMap, forMember, mapFrom } from '@automapper/core'
import { pojos, PojosMetadataMap } from '@automapper/pojos'

PojosMetadataMap.create<IUser>('IUser')
PojosMetadataMap.create<IUserRegiser>('IUserRegiser')
PojosMetadataMap.create<IAuthUser>('IAuthUser')
PojosMetadataMap.create<IUserUpdateData>('IUserUpdate')
PojosMetadataMap.create<IUserUpdate>('IUserUpdate')

const create = () => createMapper({ strategyInitializer: pojos() })

export function updateDataToUserUpdateMapper(): Mapper {
	const mapper = create()
	createMap<IUserUpdateData, IUserUpdate>(
		mapper,
		'IUserUpdateData',
		'IUserUpdate',
		forMember(
			d => d.fullname,
			mapFrom(s => s.name)
		),
		forMember(
			d => d.phone,
			mapFrom(s => {
				return s.phone?.trim()
			})
		)
	)
	return mapper
}

export function userToAuthMapper(): Mapper {
	const mapper = create()
	createMap<IUser, IAuthUser>(
		mapper,
		'IUser',
		'IAuthUser',
		forMember(
			d => d.username,
			mapFrom(s => s.username)
		),
		forMember(
			d => d.phone,
			mapFrom(s => s.phone)
		),
		forMember(
			d => d.fullname,
			mapFrom(s => s.fullname)
		)
	)
	return mapper
}

export function userRegisterToUserMapper(): Mapper {
	const mapper = create()
	createMap<IUserRegiser, IUser>(
		mapper,
		'IUserRegister',
		'IUser',
		forMember(
			d => d.username,
			mapFrom(s => s.user?.trim())
		),
		forMember(
			d => d.phone,
			mapFrom(s => {
				return s.phone?.trim()
			})
		),
		forMember(
			d => d.fullname,
			mapFrom(s => s.name?.trim())
		),
		forMember(
			d => d.email,
			mapFrom(s => s.user?.trim())
		),
		forMember(
			d => d.password,
			mapFrom(s => s.pass)
		),
		forMember(
			d => d.str,
			mapFrom(() => '')
		)
	)
	return mapper
}
