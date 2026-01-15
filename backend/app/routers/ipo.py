"""
IPO Router - Endpoints for IPO tracking
"""
from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/ipo", tags=["IPO"])


@router.get("/upcoming")
async def get_upcoming_ipos():
    """Get list of upcoming and live IPOs with Halal screening"""
    
    # Mock IPO data - in production, this would come from a real data source
    today = datetime.now()
    
    ipos = [
        {
            "id": 1,
            "company": "TechVentures India Ltd",
            "symbol": "TECHVENT",
            "priceRange": "₹450 - ₹475",
            "issueSize": "₹1,200 Cr",
            "openDate": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
            "status": "upcoming",
            "isHalal": True,
            "sector": "Technology",
            "lotSize": 31,
            "subscriptionTimes": None,
            "halalReason": "Software services, no prohibited activities"
        },
        {
            "id": 2,
            "company": "Green Energy Solutions",
            "symbol": "GREENSOL",
            "priceRange": "₹280 - ₹295",
            "issueSize": "₹850 Cr",
            "openDate": (today - timedelta(days=1)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "status": "live",
            "isHalal": True,
            "sector": "Energy",
            "lotSize": 50,
            "subscriptionTimes": round(random.uniform(2.0, 4.0), 2),
            "halalReason": "Renewable energy, Shariah compliant"
        },
        {
            "id": 3,
            "company": "Premium Spirits Ltd",
            "symbol": "PREMSPIR",
            "priceRange": "₹520 - ₹545",
            "issueSize": "₹2,100 Cr",
            "openDate": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
            "status": "live",
            "isHalal": False,
            "sector": "FMCG",
            "lotSize": 27,
            "subscriptionTimes": round(random.uniform(5.0, 8.0), 2),
            "halalReason": "Alcohol manufacturing - prohibited"
        },
        {
            "id": 4,
            "company": "HealthCare Plus",
            "symbol": "HCPLUS",
            "priceRange": "₹180 - ₹195",
            "issueSize": "₹650 Cr",
            "openDate": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=13)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=18)).strftime("%Y-%m-%d"),
            "status": "upcoming",
            "isHalal": True,
            "sector": "Healthcare",
            "lotSize": 76,
            "subscriptionTimes": None,
            "halalReason": "Healthcare services, ethical business"
        },
        {
            "id": 5,
            "company": "FinServe Capital",
            "symbol": "FINCAP",
            "priceRange": "₹320 - ₹340",
            "issueSize": "₹1,800 Cr",
            "openDate": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=9)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=14)).strftime("%Y-%m-%d"),
            "status": "upcoming",
            "isHalal": False,
            "sector": "Finance",
            "lotSize": 44,
            "subscriptionTimes": None,
            "halalReason": "Interest-based lending - prohibited"
        },
        {
            "id": 6,
            "company": "Organic Foods India",
            "symbol": "ORGFOOD",
            "priceRange": "₹125 - ₹135",
            "issueSize": "₹400 Cr",
            "openDate": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "closeDate": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "listingDate": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
            "status": "upcoming",
            "isHalal": True,
            "sector": "FMCG",
            "lotSize": 110,
            "subscriptionTimes": None,
            "halalReason": "Organic food products, halal certified"
        }
    ]
    
    return {
        "ipos": ipos,
        "total": len(ipos),
        "halalCount": len([i for i in ipos if i["isHalal"]]),
        "liveCount": len([i for i in ipos if i["status"] == "live"]),
        "timestamp": datetime.now().isoformat()
    }
