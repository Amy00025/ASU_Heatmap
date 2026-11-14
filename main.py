import random
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="ASU Sun Devil Crowd Tracker API",
    description="Live occupancy & crowd density sensor API for ASU Tempe campus.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HourlyTrend(BaseModel):
    hour: str
    percentage: int
    label: Optional[str] = None

class LocationRecord(BaseModel):
    id: str
    name: str
    shortName: str
    category: str  # 'Fitness' | 'Study' | 'Dining' | 'Union'
    occupancyPercentage: int
    crowdLevel: str  # 'Low' | 'Moderate' | 'High' | 'Very Busy'
    currentCapacity: int
    maxCapacity: int
    averageVisitDurationMinutes: int
    lastUpdated: str
    lat: float
    lng: float
    heatWeight: int
    description: str
    address: str
    popularTimesSummary: str
    hourlyTrends: List[HourlyTrend]

# Database in-memory store initialized with ASU Tempe benchmark data
LOCATIONS_DB: List[dict] = [
    {
        "id": "sdfc-tempe",
        "name": "Sun Devil Fitness Complex (SDFC)",
        "shortName": "SDFC Fitness",
        "category": "Fitness",
        "occupancyPercentage": 88,
        "crowdLevel": "Very Busy",
        "currentCapacity": 704,
        "maxCapacity": 800,
        "averageVisitDurationMinutes": 65,
        "lastUpdated": "Just now",
        "lat": 33.4168,
        "lng": -111.9330,
        "heatWeight": 92,
        "description": "State-of-the-art recreation center featuring cardio floors, weight rooms, basketball courts, and outdoor pools.",
        "address": "400 E Apache Blvd, Tempe, AZ 85287",
        "popularTimesSummary": "Peak hours usually between 4 PM and 8 PM.",
        "hourlyTrends": [
            {"hour": "8 AM", "percentage": 25},
            {"hour": "9 AM", "percentage": 38},
            {"hour": "10 AM", "percentage": 45},
            {"hour": "11 AM", "percentage": 52},
            {"hour": "12 PM", "percentage": 58},
            {"hour": "1 PM", "percentage": 60},
            {"hour": "2 PM", "percentage": 64},
            {"hour": "3 PM", "percentage": 72},
            {"hour": "4 PM", "percentage": 85},
            {"hour": "5 PM", "percentage": 94},
            {"hour": "6 PM", "percentage": 96},
            {"hour": "7 PM", "percentage": 88},
            {"hour": "8 PM", "percentage": 75},
            {"hour": "9 PM", "percentage": 50},
            {"hour": "10 PM", "percentage": 28},
        ],
    },
    {
        "id": "hayden-library",
        "name": "Hayden Library",
        "shortName": "Hayden Library",
        "category": "Study",
        "occupancyPercentage": 74,
        "crowdLevel": "High",
        "currentCapacity": 1110,
        "maxCapacity": 1500,
        "averageVisitDurationMinutes": 120,
        "lastUpdated": "2 mins ago",
        "lat": 33.4190,
        "lng": -111.9348,
        "heatWeight": 78,
        "description": "ASU’s primary research library with 5 floors of study spaces, group study rooms, and Maker Studio.",
        "address": "300 E Orange St, Tempe, AZ 85281",
        "popularTimesSummary": "Heaviest study traffic between 11 AM and 5 PM.",
        "hourlyTrends": [
            {"hour": "8 AM", "percentage": 20},
            {"hour": "9 AM", "percentage": 35},
            {"hour": "10 AM", "percentage": 55},
            {"hour": "11 AM", "percentage": 70},
            {"hour": "12 PM", "percentage": 82},
            {"hour": "1 PM", "percentage": 88},
            {"hour": "2 PM", "percentage": 90},
            {"hour": "3 PM", "percentage": 85},
            {"hour": "4 PM", "percentage": 78},
            {"hour": "5 PM", "percentage": 74},
            {"hour": "6 PM", "percentage": 68},
            {"hour": "7 PM", "percentage": 62},
            {"hour": "8 PM", "percentage": 55},
            {"hour": "9 PM", "percentage": 40},
            {"hour": "10 PM", "percentage": 22},
        ],
    },
    {
        "id": "memorial-union",
        "name": "Memorial Union (MU)",
        "shortName": "Memorial Union",
        "category": "Union",
        "occupancyPercentage": 62,
        "crowdLevel": "Moderate",
        "currentCapacity": 1240,
        "maxCapacity": 2000,
        "averageVisitDurationMinutes": 45,
        "lastUpdated": "1 min ago",
        "lat": 33.4178,
        "lng": -111.9352,
        "heatWeight": 65,
        "description": "The heart of campus life offering food courts, student union services, bowling alley, and lounges.",
        "address": "301 E Orange St, Tempe, AZ 85281",
        "popularTimesSummary": "Lunch rush spikes from 11:30 AM to 1:30 PM.",
        "hourlyTrends": [
            {"hour": "8 AM", "percentage": 15},
            {"hour": "9 AM", "percentage": 30},
            {"hour": "10 AM", "percentage": 48},
            {"hour": "11 AM", "percentage": 78},
            {"hour": "12 PM", "percentage": 95},
            {"hour": "1 PM", "percentage": 89},
            {"hour": "2 PM", "percentage": 68},
            {"hour": "3 PM", "percentage": 55},
            {"hour": "4 PM", "percentage": 50},
            {"hour": "5 PM", "percentage": 62},
            {"hour": "6 PM", "percentage": 70},
            {"hour": "7 PM", "percentage": 58},
            {"hour": "8 PM", "percentage": 40},
            {"hour": "9 PM", "percentage": 25},
            {"hour": "10 PM", "percentage": 10},
        ],
    },
    {
        "id": "tooker-dining",
        "name": "Tooker Dining Hall",
        "shortName": "Tooker Dining",
        "category": "Dining",
        "occupancyPercentage": 45,
        "crowdLevel": "Moderate",
        "currentCapacity": 247,
        "maxCapacity": 550,
        "averageVisitDurationMinutes": 35,
        "lastUpdated": "Just now",
        "lat": 33.4215,
        "lng": -111.9318,
        "heatWeight": 48,
        "description": "Modern residential dining hall situated inside Tooker House engineering residential complex.",
        "address": "500 E University Dr, Tempe, AZ 85281",
        "popularTimesSummary": "Dinner rush starts at 5:30 PM.",
        "hourlyTrends": [
            {"hour": "8 AM", "percentage": 40},
            {"hour": "9 AM", "percentage": 50},
            {"hour": "10 AM", "percentage": 30},
            {"hour": "11 AM", "percentage": 42},
            {"hour": "12 PM", "percentage": 75},
            {"hour": "1 PM", "percentage": 68},
            {"hour": "2 PM", "percentage": 35},
            {"hour": "3 PM", "percentage": 25},
            {"hour": "4 PM", "percentage": 30},
            {"hour": "5 PM", "percentage": 65},
            {"hour": "6 PM", "percentage": 88},
            {"hour": "7 PM", "percentage": 76},
            {"hour": "8 PM", "percentage": 52},
            {"hour": "9 PM", "percentage": 30},
            {"hour": "10 PM", "percentage": 15},
        ],
    },
    {
        "id": "barrett-dining",
        "name": "Barrett Dining Center",
        "shortName": "Barrett Dining",
        "category": "Dining",
        "occupancyPercentage": 28,
        "crowdLevel": "Low",
        "currentCapacity": 168,
        "maxCapacity": 600,
        "averageVisitDurationMinutes": 40,
        "lastUpdated": "4 mins ago",
        "lat": 33.4146,
        "lng": -111.9310,
        "heatWeight": 30,
        "description": "Award-winning dining hall serving fresh, made-to-order sustainable gourmet dishes.",
        "address": "1285 S Cady Mall, Tempe, AZ 85281",
        "popularTimesSummary": "Most active during dinner service around 6 PM.",
        "hourlyTrends": [
            {"hour": "8 AM", "percentage": 30},
            {"hour": "9 AM", "percentage": 42},
            {"hour": "10 AM", "percentage": 25},
            {"hour": "11 AM", "percentage": 38},
            {"hour": "12 PM", "percentage": 70},
            {"hour": "1 PM", "percentage": 60},
            {"hour": "2 PM", "percentage": 28},
            {"hour": "3 PM", "percentage": 20},
            {"hour": "4 PM", "percentage": 25},
            {"hour": "5 PM", "percentage": 58},
            {"hour": "6 PM", "percentage": 82},
            {"hour": "7 PM", "percentage": 65},
            {"hour": "8 PM", "percentage": 42},
            {"hour": "9 PM", "percentage": 22},
            {"hour": "10 PM", "percentage": 10},
        ],
    },
]

def calculate_crowd_level(percentage: int) -> str:
    if percentage >= 85:
        return "Very Busy"
    elif percentage >= 70:
        return "High"
    elif percentage >= 40:
        return "Moderate"
    else:
        return "Low"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "ASU Sun Devil Crowd Tracker FastAPI Server",
        "endpoint": "/api/crowd-data",
        "docs": "/docs"
    }

@app.get("/api/crowd-data", response_model=List[LocationRecord])
def get_crowd_data(simulate_live_sensors: bool = True):
    """
    Main endpoint requested by the Next.js frontend.
    Returns real-time occupancy data for all tracked ASU Tempe locations.
    """
    if simulate_live_sensors:
        for loc in LOCATIONS_DB:
            # Simulate slight sensor jitter (± 3%)
            delta = random.randint(-3, 3)
            new_occ = max(5, min(99, loc["occupancyPercentage"] + delta))
            loc["occupancyPercentage"] = new_occ
            loc["currentCapacity"] = int((new_occ / 100.0) * loc["maxCapacity"])
            loc["heatWeight"] = new_occ
            loc["crowdLevel"] = calculate_crowd_level(new_occ)
            loc["lastUpdated"] = datetime.now().strftime("%I:%M %p").lstrip("0")
    
    return LOCATIONS_DB

@app.get("/api/crowd-data/{location_id}", response_model=LocationRecord)
def get_single_location(location_id: str):
    for loc in LOCATIONS_DB:
        if loc["id"] == location_id:
            return loc
    raise HTTPException(status_code=404, detail="Location not found")

@app.post("/api/crowd-data/{location_id}/update")
def update_occupancy(location_id: str, new_percentage: int):
    """
    Simulate updating an occupancy sensor for a venue.
    """
    if not (0 <= new_percentage <= 100):
        raise HTTPException(status_code=400, detail="Percentage must be between 0 and 100")
    
    for loc in LOCATIONS_DB:
        if loc["id"] == location_id:
            loc["occupancyPercentage"] = new_percentage
            loc["currentCapacity"] = int((new_percentage / 100.0) * loc["maxCapacity"])
            loc["heatWeight"] = new_percentage
            loc["crowdLevel"] = calculate_crowd_level(new_percentage)
            loc["lastUpdated"] = datetime.now().strftime("%I:%M %p").lstrip("0")
            return {"status": "updated", "data": loc}
            
    raise HTTPException(status_code=404, detail="Location not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
