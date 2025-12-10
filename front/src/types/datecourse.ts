export type ActivityType = 'CAFE' | 'RESTAURANT' | 'PARK' | 'CINEMA' | 'ETC';

export interface RecommendationFoodRequest {
    foodName: string;
    foodPrice: number;
}

export interface ActivityRequest {
    activityType: ActivityType;
    activityName: string;
    activityContent: string;
    location: string;
    lnmadr?: string;
    rdnmadr?: string;
    latitude: number;
    longitude: number;
    tellNumber?: string;
    runningTime: number;
    recommendationFoods: RecommendationFoodRequest[];
    tags?: string[]; // 'PARKING', 'PET'
}

export interface DateCourseRequest {
    title: string;
    startAt: string;
    endAt: string;
    activities: ActivityRequest[];
}

export interface DateCourseResponse {
    id: number;
    title: string;
    startAt: string;
    endAt: string;
    activities: ActivityRequest[];
}