package com.example.backend.request;

public class CreateDashboardRequest {
    CreateDashboardRequest(){};
    private String user_id;

    public String getUserId() {
        return user_id;
    }

    public void setUserId(String user_id) {
        this.user_id = user_id;
    }
}
