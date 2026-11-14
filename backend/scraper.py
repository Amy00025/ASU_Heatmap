from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    import livepopulartimes
except ImportError:
    livepopulartimes = None

# Mapping of ASU Tempe Locations with coordinates & meta
ASU_LOCATIONS = [
    {
        "id": "sdfc",
        "name": "Sun Devil Fitness Complex",
        "shortName": "SDFC Fitness",
        "category": "Fitness",
        "address": "Sun Devil Fitness Complex, 400 E Apache Blvd, Tempe, AZ 85287",
        "coordinates": {"lat": 33.4168, "lng": -111.9330},
        "maxCapacity": 800,
        "description": "State-of-the-art recreation center featuring cardio floors, weight rooms, basketball courts, and outdoor pools.",
        "popularTimesSummary": "Peak hours usually between 4 PM and 8 PM."
    },
    {
        "id": "hayden",
        "name": "Hayden Library",
        "shortName": "Hayden Library",
        "category": "Study",
        "address": "Hayden Library, 300 E Orange St, Tempe, AZ 85281",
        "coordinates": {"lat": 33.4190, "lng": -111.9348},
        "maxCapacity": 1500,
        "description": "ASU’s primary research library with 5 floors of study spaces, group study rooms, and Maker Studio.",
        "popularTimesSummary": "Heaviest study traffic between 11 AM and 5 PM."
    },
    {
        "id": "mu",
        "name": "Memorial Union",
        "shortName": "Memorial Union",
        "category": "Union",
        "address": "Memorial Union, 301 E Orange St, Tempe, AZ 85281",
        "coordinates": {"lat": 33.4178, "lng": -111.9352},
        "maxCapacity": 2000,
        "description": "The heart of campus life offering food courts, student union services, bowling alley, and lounges.",
        "popularTimesSummary": "Lunch rush spikes from 11:30 AM to 1:30 PM."
    },
    {
        "id": "tooker",
        "name": "Tooker House Dining",
        "shortName": "Tooker Dining",
        "category": "Dining",
        "address": "Tooker House Dining Hall, 500 E University Dr, Tempe, AZ 85281",
        "coordinates": {"lat": 33.4215, "lng": -111.9318},
        "maxCapacity": 550,
        "description": "Modern residential dining hall situated inside Tooker House engineering residential complex.",
        "popularTimesSummary": "Dinner rush starts at 5:30 PM."
    },
    {
        "id": "barrett",
        "name": "Barrett Dining Center",
        "shortName": "Barrett Dining",
        "category": "Dining",
        "address": "Barrett Dining Center, 1285 S Cady Mall, Tempe, AZ 85281",
        "coordinates": {"lat": 33.4146, "lng": -111.9310},
        "maxCapacity": 600,
        "description": "Award-winning dining hall serving fresh, made-to-order sustainable gourmet dishes.",
        "popularTimesSummary": "Most active during dinner service around 6 PM."
    }
]

def calculate_crowd_level(busyness: int) -> str:
    if busyness >= 80:
        return "Very Busy"
    elif busyness >= 60:
        return "High"
    elif busyness >= 35:
        return "Moderate"
    return "Low"

def format_hourly_trends(weekly_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extracts today's hourly busyness curve from livepopulartimes weekly array."""
    if not weekly_data:
        # Default fallback schedule if unavailable
        return [
            {"hour": "8 AM", "busyness": 25, "percentage": 25},
            {"hour": "10 AM", "busyness": 45, "percentage": 45},
            {"hour": "12 PM", "busyness": 75, "percentage": 75},
            {"hour": "2 PM", "busyness": 65, "percentage": 65},
            {"hour": "4 PM", "busyness": 85, "percentage": 85},
            {"hour": "6 PM", "busyness": 90, "percentage": 90},
            {"hour": "8 PM", "busyness": 60, "percentage": 60},
            {"hour": "10 PM", "busyness": 25, "percentage": 25}
        ]

    # Python datetime weekday: 0=Monday, 6=Sunday
    today_index = datetime.today().weekday()
    today_hours = weekly_data[today_index].get("data", []) if len(weekly_data) > today_index else []

    formatted_trends = []
    # Extract key operational hours: 8 AM (idx 8) to 10 PM (idx 22)
    hour_indices = [8, 10, 12, 14, 16, 18, 20, 22]
    
    for idx in hour_indices:
        hour_label = datetime.strptime(str(idx), "%H").strftime("%I %p").lstrip("0")
        score = today_hours[idx] if idx < len(today_hours) else 0
        formatted_trends.append({
            "hour": hour_label,
            "busyness": score,
            "percentage": score
        })

    return formatted_trends

def fetch_live_asu_crowd_data() -> List[Dict[str, Any]]:
    records = []
    current_time_str = datetime.now().strftime("%I:%M %p")

    for loc in ASU_LOCATIONS:
        live_score = None
        weekly_data = []
        avg_time = "45 min"

        benchmark_scores = {"sdfc": 88, "hayden": 74, "mu": 62, "tooker": 46, "barrett": 28}

        if livepopulartimes is not None:
            try:
                # Scrape public popular times from Google Search/Maps
                data = livepopulartimes.get_populartimes_by_address(loc["address"])
                
                live_score = data.get("current_popularity")
                weekly_data = data.get("populartimes", [])
                avg_time = data.get("time_spent", "45 min")

                # Fallback to current hour historical average if live metric is missing
                if live_score is None:
                    today_index = datetime.today().weekday()
                    current_hour = datetime.now().hour
                    if weekly_data and len(weekly_data) > today_index:
                        hourly_arr = weekly_data[today_index].get("data", [])
                        if len(hourly_arr) > current_hour and hourly_arr[current_hour] > 0:
                            live_score = hourly_arr[current_hour]
                        else:
                            live_score = benchmark_scores.get(loc["id"], 50)
                    else:
                        live_score = benchmark_scores.get(loc["id"], 50)

            except Exception as e:
                print(f"Scraper notice for {loc['id']}: {e}")
                live_score = benchmark_scores.get(loc["id"], 50)
                avg_time = "45 min"
        else:
            live_score = benchmark_scores.get(loc["id"], 50)

        occupancy = live_score if live_score is not None else 50
        max_cap = loc.get("maxCapacity", 1000)
        curr_cap = int((occupancy / 100.0) * max_cap)

        records.append({
            "id": loc["id"],
            "name": loc["name"],
            "shortName": loc["shortName"],
            "category": loc["category"],
            "address": loc["address"],
            "coordinates": loc["coordinates"],
            "lat": loc["coordinates"]["lat"],
            "lng": loc["coordinates"]["lng"],
            "currentBusyness": occupancy,
            "occupancyPercentage": occupancy,
            "crowdLevel": calculate_crowd_level(occupancy),
            "currentCapacity": curr_cap,
            "maxCapacity": max_cap,
            "averageVisitDurationMinutes": int(avg_time.split()[0]) if avg_time.split()[0].isdigit() else 45,
            "avgTimeSpent": avg_time,
            "updatedAt": f"Updated at {current_time_str}",
            "lastUpdated": f"Updated {current_time_str}",
            "heatWeight": occupancy,
            "description": loc.get("description", ""),
            "popularTimesSummary": loc.get("popularTimesSummary", ""),
            "hourlyTrends": format_hourly_trends(weekly_data)
        })

    return records
