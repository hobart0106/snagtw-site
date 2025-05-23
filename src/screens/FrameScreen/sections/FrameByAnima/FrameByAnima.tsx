import {
  BellIcon,
  ClockIcon,
  HeartIcon,
  LinkIcon,
  ShareIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { supabase } from "../../../../lib/supabase";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Promotion {
  id: string;
  brand_icon_url: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  source_url: string;
}

interface FrameByAnimaProps {
  selectedDate: number;
}

export const FrameByAnima = ({ selectedDate }: FrameByAnimaProps): JSX.Element => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [likedPromos, setLikedPromos] = useState<Set<string>>(new Set());
  const [reminderPromos, setReminderPromos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const now = dayjs().tz('Asia/Taipei');
        const selectedDateObj = now.date(selectedDate);
        const formattedDate = selectedDateObj.format('YYYY-MM-DD');

        console.log('Fetching promotions for date:', formattedDate);
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

        const { data, error: supabaseError } = await supabase
          .from('promotions')
          .select('*')
          .lte('start_date', formattedDate)
          .gte('end_date', formattedDate);

        if (supabaseError) {
          console.error('Supabase query error:', supabaseError);
          throw supabaseError;
        }

        console.log('Fetched promotions:', data);
        setPromotions(data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load promotions');
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [selectedDate]);

  const handleShare = (promo: Promotion) => {
    const shareText = `${promo.title}\n活動期間：${promo.start_date} ~ ${promo.end_date}\n${promo.description}`;
    const shareUrl = promo.source_url || window.location.href;
    const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}\n${encodeURIComponent(shareUrl)}`;
    window.open(lineShareUrl, '_blank');
  };

  const toggleLike = (promoId: string) => {
    setLikedPromos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promoId)) {
        newSet.delete(promoId);
      } else {
        newSet.add(promoId);
      }
      return newSet;
    });
  };

  const toggleReminder = (promoId: string) => {
    setReminderPromos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promoId)) {
        newSet.delete(promoId);
      } else {
        newSet.add(promoId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card className="w-full rounded-[16px] bg-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">載入中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full rounded-[16px] bg-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (promotions.length === 0) {
    return (
      <Card className="w-full rounded-[16px] bg-white shadow-lg border-0">
        <CardContent className="p-4">
          <div className="text-center py-8">
            <p className="text-gray-500">今日無優惠活動</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col w-full gap-2 max-h-[calc(100vh-280px)] overflow-y-auto">
      {promotions.map((promo) => (
        <Card key={promo.id} className="w-full rounded-[16px] bg-white shadow-lg border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <img
                className="w-[58px] h-[58px] rounded-full object-cover"
                alt="品牌圖示"
                src={promo.brand_icon_url}
              />

              <div className="flex flex-col w-full gap-2">
                <h3 className="font-bold text-[16px] leading-[1.5] text-black">
                  {promo.title}
                </h3>

                <p className="text-[13px] leading-[1.5] text-black">
                  {promo.description}
                </p>

                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-[13px] leading-[1.5] text-black">
                    {promo.start_date} ~ {promo.end_date}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between px-4">
                  <a 
                    href={promo.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2"
                  >
                    <LinkIcon className="w-6 h-6" />
                  </a>
                  <button 
                    className="p-2"
                    onClick={() => handleShare(promo)}
                  >
                    <ShareIcon className="w-6 h-6" />
                  </button>
                  <button 
                    className="p-2"
                    onClick={() => toggleLike(promo.id)}
                  >
                    <HeartIcon 
                      className={`w-6 h-6 transition-colors duration-200 ${
                        likedPromos.has(promo.id) ? 'fill-current text-red-500' : ''
                      }`} 
                    />
                  </button>
                  <button 
                    className="p-2 relative"
                    onClick={() => toggleReminder(promo.id)}
                  >
                    <div className="relative">
                      <BellIcon 
                        className={`w-6 h-6 transition-colors duration-200 ${
                          reminderPromos.has(promo.id) ? 'fill-current text-[#FFAB35]' : ''
                        }`}
                      />
                      {reminderPromos.has(promo.id) && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFAB35] rounded-full" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};