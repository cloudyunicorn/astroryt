import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getAllUsers } from '@/lib/actions/user.action';
import Link from 'next/link';
import React from 'react';

const AllUserBox = async () => {
  const allUsers = await getAllUsers();
  return (
    <div className="p-4 px-10 flex-center gap-2">
      {allUsers.map((user) => (
        <div key={user.id} className="w-full">
          <Card className="w-full max-w-sm">
            <CardHeader className="p-0 items-center">
              <Link href={`/user/${user.id}`}></Link>
            </CardHeader>
            <CardContent className="p-4 grid gap-4">
              <Link href={`/user/${user.id}`}>
                <h2 className="text-sm font-medium">{user.name}</h2>
              </Link>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default AllUserBox;
