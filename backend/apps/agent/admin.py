from django.contrib import admin
from django.utils import timezone
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
    PasswordChangeRequest,
    SessionalMarks,
    StudentAuth,
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


@admin.register(StudentAuth)
class StudentAuthAdmin(ModelAdmin):
    list_display = ("student", "password_changed", "updated_at")
    search_fields = ("student__roll_no", "student__name")
    list_filter = ("password_changed",)
    ordering = ("student__roll_no",)
    readonly_fields = ("student", "password_hash", "password_changed", "created_at", "updated_at")
    actions = ["reset_to_default_password", "unlock_password_change"]

    @admin.action(description="Reset selected students' passwords to default (reversed roll no)")
    def reset_to_default_password(self, request, queryset):
        count = 0
        for auth in queryset.select_related("student"):
            auth.set_password(auth.student.roll_no[::-1])
            auth.password_changed = False
            auth.save()
            count += 1
        self.message_user(request, f"Reset {count} password(s) to default.")

    @admin.action(description="Unlock password change (allow student to change again)")
    def unlock_password_change(self, request, queryset):
        count = queryset.update(password_changed=False)
        self.message_user(request, f"Unlocked password change for {count} student(s).")


@admin.register(PasswordChangeRequest)
class PasswordChangeRequestAdmin(ModelAdmin):
    list_display = ("id", "student", "status", "created_at", "resolved_at")
    search_fields = ("student__roll_no", "student__name")
    list_filter = ("status", "created_at")
    ordering = ("-created_at",)
    readonly_fields = ("student", "requested_password", "created_at")
    actions = ["apply_requested_password"]

    def save_model(self, request, obj, form, change):
        if obj.status == "resolved" and not obj.resolved_at:
            obj.resolved_at = timezone.now()
        super().save_model(request, obj, form, change)

    @admin.action(description="Apply requested password and mark as resolved")
    def apply_requested_password(self, request, queryset):
        from .models import StudentAuth
        count = 0
        for req in queryset.filter(status="pending").select_related("student"):
            try:
                auth = req.student.auth
                auth.set_password(req.requested_password)
                auth.password_changed = True
                auth.save()
                req.status = "resolved"
                req.resolved_at = timezone.now()
                req.save()
                count += 1
            except StudentAuth.DoesNotExist:
                pass
        self.message_user(request, f"Applied and resolved {count} password change request(s).")


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
