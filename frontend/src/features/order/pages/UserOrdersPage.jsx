import React from 'react'
import { UserOrders } from '../components/UserOrders'
import {Navbar} from '../../../layout/Navbar'
import {Footer} from '../../../layout/Footer'

export const UserOrdersPage = () => {
  return (
    <>
    <Navbar/>
    <UserOrders/>
    <Footer/>
    </>
  )
}
