// components/ProfileSettingsCard.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getBirthChartByUserId, getUserById, updateBirthChart, updateUserProfile } from "@/lib/actions/user.action";

export default function ProfileSettingsCard({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<{
    name?: string;
    email?: string;
    birthLocation?: string;
  }>({});
  
  const [birthChartData, setBirthChartData] = useState<{
    birthDate?: Date;
    birthTime?: string;
  }>({});
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const user = await getUserById(userId);
      const birthChart = await getBirthChartByUserId(userId);
      
      setUserData({
        name: user?.name || '',
        email: user?.email || '',
        birthLocation: user?.birthLocation || ''
      });
      
      if (birthChart) {
        setBirthChartData({
          birthDate: birthChart.birthDate,
          birthTime: format(birthChart.birthTime, 'HH:mm')
        });
      }
    };
    
    loadData();
  }, [userId]);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSave = async (field: string) => {
    try {
      if (field === 'name' || field === 'birthLocation') {
        await updateUserProfile(userId, { [field]: tempValue });
        setUserData(prev => ({ ...prev, [field]: tempValue }));
      }
      
      if (field === 'birthDate' || field === 'birthTime') {
        const updateData = {
          birthDate: field === 'birthDate' ? new Date(tempValue) : birthChartData.birthDate,
          birthTime: field === 'birthTime' ? tempValue : birthChartData.birthTime
        };
        
        await updateBirthChart(userId, updateData);
        setBirthChartData(prev => ({
          ...prev,
          ...updateData
        }));
      }
      
      setEditingField(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const renderEditableField = (field: string, label: string, value: string) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {editingField === field ? (
          <Input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="w-full max-w-xs"
          />
        ) : (
          <p className="text-lg">{value || 'Not set'}</p>
        )}
      </div>
      {editingField === field ? (
        <div className="flex gap-2 ml-4">
          <Button variant="outline" size="sm" onClick={() => setEditingField(null)}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => handleSave(field)}>
            Save
          </Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => handleEdit(field, value)}>
          Edit
        </Button>
      )}
    </div>
  );

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderEditableField('name', 'Name', userData.name || '')}
        {renderEditableField('email', 'Email', userData.email || '')}

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
              {editingField === 'birthDate' ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      {tempValue ? format(new Date(tempValue), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tempValue ? new Date(tempValue) : undefined}
                      onSelect={(date) => date && setTempValue(date.toISOString())}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-lg">
                  {birthChartData.birthDate ? format(birthChartData.birthDate, 'PPP') : 'Not set'}
                </p>
              )}
            </div>
            {editingField === 'birthDate' ? (
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => setEditingField(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave('birthDate')}>
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => {
                setEditingField('birthDate');
                setTempValue(birthChartData.birthDate?.toISOString() || '');
              }}>
                Edit
              </Button>
            )}
          </div>
        </div>

        {renderEditableField('birthTime', 'Birth Time', birthChartData.birthTime || '')}
        {renderEditableField('birthLocation', 'Birth Location', userData.birthLocation || '')}
      </CardContent>
    </Card>
  );
}