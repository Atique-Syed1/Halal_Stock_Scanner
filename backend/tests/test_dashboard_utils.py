from app.routers.dashboard import _format_stock_summary

def test_format_stock_summary():
    stock = {
        "symbol": "TCS.NS",
        "name": "Tata Cons",
        "price": 3000,
        "priceChange": 50,
        "priceChangePercent": 1.5,
        "extra": "ignore"
    }
    result = _format_stock_summary(stock)
    assert result["symbol"] == "TCS"
    assert result["name"] == "Tata Cons"
    assert result["price"] == 3000
    assert result["change"] == 50
    assert result["changePercent"] == 1.5
    assert "extra" not in result
