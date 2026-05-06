import pytest
from unittest.mock import MagicMock, create_autospec

from sqlalchemy.orm import Session

from services.stats_service import StatsService
from repositories.stats_repository import (
    StatsRepository,
    get_date_range,
    calculate_trend,
    compute_monthly_start,
    build_monthly_series,
    compute_monthly_trend,
    MONTH_NAMES,
)
from core.exceptions import ForbiddenException


@pytest.fixture
def mock_db():
    return create_autospec(Session, instance=True)


@pytest.fixture
def mock_repo():
    return create_autospec(StatsRepository, instance=True)


@pytest.fixture
def service(mock_db, mock_repo):
    return StatsService(mock_db, repo=mock_repo)


class TestGetDateRange:
    def test_today(self):
        start, end, prev_start, prev_end = get_date_range("today")
        assert start == end

    def test_yesterday(self):
        from datetime import datetime, timedelta
        today = datetime.now().date()
        start, end, _, _ = get_date_range("yesterday")
        assert start == today - timedelta(days=1)

    def test_unknown_defaults_to_today(self):
        start, end, _, _ = get_date_range("unknown")
        from datetime import datetime
        assert start == datetime.now().date()


class TestCalculateTrend:
    def test_positive_trend(self):
        assert calculate_trend(150, 100) == 50.0

    def test_negative_trend(self):
        assert calculate_trend(50, 100) == -50.0

    def test_zero_to_positive(self):
        assert calculate_trend(10, 0) == 100

    def test_zero_to_zero(self):
        assert calculate_trend(0, 0) == 0


class TestComputeMonthlyStart:
    def test_returns_tuple_of_three(self):
        result = compute_monthly_start(6)
        assert len(result) == 3
        year, month, start_date = result
        assert isinstance(year, int)
        assert isinstance(month, int)

    def test_one_month(self):
        from datetime import datetime
        today = datetime.now().date()
        year, month, start_date = compute_monthly_start(1)
        assert year == today.year
        assert month == today.month


class TestBuildMonthlySeries:
    def test_correct_length(self):
        data_dict = {}
        result = build_monthly_series(2025, 12, 6, data_dict)
        assert len(result) == 6

    def test_fills_zeros_for_missing(self):
        result = build_monthly_series(2025, 1, 3, {})
        for entry in result:
            assert entry["count"] == 0
            assert entry["amount"] == 0.0

    def test_uses_data_dict(self):
        data_dict = {"2025-1": {"count": 5, "amount": 100.0}}
        result = build_monthly_series(2025, 1, 1, data_dict)
        assert result[0]["count"] == 5
        assert result[0]["amount"] == 100.0


class TestComputeMonthlyTrend:
    def test_empty_data(self):
        assert compute_monthly_trend([]) == 0.0

    def test_single_data_point(self):
        assert compute_monthly_trend([{"count": 5}]) == 0.0

    def test_positive_trend(self):
        data = [{"count": 10}, {"count": 20}]
        assert compute_monthly_trend(data) == 100.0

    def test_negative_trend(self):
        data = [{"count": 20}, {"count": 10}]
        assert compute_monthly_trend(data) == -50.0


class TestStatsServiceCashSummary:
    def test_non_admin_raises_forbidden(self, service):
        user = MagicMock()
        user.role.value = "secretary"

        with pytest.raises(ForbiddenException):
            service.get_cash_summary(user)


class TestMonthNames:
    def test_has_13_entries(self):
        assert len(MONTH_NAMES) == 13

    def test_first_is_empty(self):
        assert MONTH_NAMES[0] == ""

    def test_january(self):
        assert MONTH_NAMES[1] == "ene"
