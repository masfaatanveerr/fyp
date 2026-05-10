from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, User
from django_celery_beat.admin import ClockedScheduleAdmin as BaseClockedScheduleAdmin
from django_celery_beat.admin import CrontabScheduleAdmin as BaseCrontabScheduleAdmin
from django_celery_beat.admin import PeriodicTaskAdmin as BasePeriodicTaskAdmin
from django_celery_beat.admin import PeriodicTaskForm, TaskSelectWidget
from django_celery_beat.models import (
    ClockedSchedule,
    CrontabSchedule,
    IntervalSchedule,
    PeriodicTask,
    SolarSchedule,
)
from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from unfold.widgets import UnfoldAdminSelectWidget, UnfoldAdminTextInputWidget

from .models import (
    AgentLog,
    AttendanceRecord,
    Complaint,
    CourseEnrollment,
    SessionalMarks,
    StudentProfile,
    TranscriptCourse,
)


admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.unregister(PeriodicTask)
admin.site.unregister(IntervalSchedule)
admin.site.unregister(CrontabSchedule)
admin.site.unregister(SolarSchedule)
admin.site.unregister(ClockedSchedule)


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm


@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass


class UnfoldTaskSelectWidget(UnfoldAdminSelectWidget, TaskSelectWidget):
    pass


class UnfoldPeriodicTaskForm(PeriodicTaskForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["task"].widget = UnfoldAdminTextInputWidget()
        self.fields["regtask"].widget = UnfoldTaskSelectWidget()


@admin.register(PeriodicTask)
class PeriodicTaskAdmin(BasePeriodicTaskAdmin, ModelAdmin):
    form = UnfoldPeriodicTaskForm


@admin.register(IntervalSchedule)
class IntervalScheduleAdmin(ModelAdmin):
    pass


@admin.register(CrontabSchedule)
class CrontabScheduleAdmin(BaseCrontabScheduleAdmin, ModelAdmin):
    pass


@admin.register(SolarSchedule)
class SolarScheduleAdmin(ModelAdmin):
    pass


@admin.register(ClockedSchedule)
class ClockedScheduleAdmin(BaseClockedScheduleAdmin, ModelAdmin):
    pass


@admin.register(StudentProfile)
class StudentProfileAdmin(ModelAdmin):
    list_display = (
        "roll_no",
        "name",
        "program",
        "section",
        "cgpa",
        "credit_hours_done",
        "degree_status",
    )
    search_fields = ("roll_no", "name", "email", "program", "section")
    list_filter = ("program", "section", "degree_status")
    ordering = ("roll_no",)


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(ModelAdmin):
    list_display = (
        "student",
        "course_code",
        "course_name",
        "credit_hours",
        "section",
        "semester",
    )
    search_fields = (
        "student__roll_no",
        "student__name",
        "course_code",
        "course_name",
        "semester",
    )
    list_filter = ("semester", "section", "credit_hours")
    ordering = ("student__roll_no", "course_code")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(ModelAdmin):
    list_display = (
        "student",
        "course_code",
        "course_name",
        "date_time",
        "status",
    )
    search_fields = (
        "student__roll_no",
        "student__name",
        "course_code",
        "course_name",
    )
    list_filter = ("status", "course_code", "date_time")
    ordering = ("-date_time",)


@admin.register(TranscriptCourse)
class TranscriptCourseAdmin(ModelAdmin):
    list_display = (
        "student",
        "semester",
        "course_code",
        "course_name",
        "grade",
        "grade_point",
        "credit_hours",
    )
    search_fields = (
        "student__roll_no",
        "student__name",
        "semester",
        "course_code",
        "course_name",
        "grade",
    )
    list_filter = ("semester", "grade", "credit_hours")
    ordering = ("student__roll_no", "semester", "course_code")


@admin.register(SessionalMarks)
class SessionalMarksAdmin(ModelAdmin):
    list_display = (
        "student",
        "course_code",
        "course_name",
        "assignment_marks",
        "quiz_marks",
        "mid_marks",
        "total_obtained",
        "total_possible",
    )
    search_fields = (
        "student__roll_no",
        "student__name",
        "course_code",
        "course_name",
    )
    list_filter = ("course_code",)
    ordering = ("student__roll_no", "course_code")


@admin.register(Complaint)
class ComplaintAdmin(ModelAdmin):
    list_display = (
        "id",
        "student",
        "subject",
        "status",
        "created_at",
        "resolved_at",
    )
    search_fields = (
        "student__roll_no",
        "student__name",
        "subject",
        "description",
    )
    list_filter = ("status", "created_at", "resolved_at")
    ordering = ("-created_at",)


@admin.register(AgentLog)
class AgentLogAdmin(ModelAdmin):
    list_display = (
        "id",
        "roll_no",
        "session_id",
        "actor_used",
        "created_at",
    )
    search_fields = (
        "roll_no",
        "session_id",
        "query",
        "response",
        "actor_used",
    )
    list_filter = ("actor_used", "created_at")
    ordering = ("-created_at",)
