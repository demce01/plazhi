
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Beach } from "@/types";
import { ReservationManagementTab as ReservationManagementTabComponent } from '@/components/admin/ReservationManagementTab';

interface AdminOutletContext {
  beaches: Beach[];
}

export default function ReservationManagementTab() {
  const { beaches = [] } = useOutletContext<AdminOutletContext>();
  
  return <ReservationManagementTabComponent beaches={beaches} />;
}
