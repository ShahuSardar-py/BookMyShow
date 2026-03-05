from locust import HttpUser, task, between

class SeatBookingUser(HttpUser):

    wait_time = between(1, 2)

    def on_start(self):
        response = self.client.post(
            "/api/auth/login",
            json={
                "username": "john_doe",
                "password": "password123"
            }
        )
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.text)

        if response.status_code == 200:
            token = response.json()["token"]

            self.headers = {
                "Authorization": f"Bearer {token}"
            }
        else:
            print("Login failed!")
            self.headers = {}

    @task
    def reserve_seat(self):

        self.client.post(
            "/api/seats/reserve",
            json={
                "seatId": 1,
                "showId": 1
            },
            headers=self.headers
        )