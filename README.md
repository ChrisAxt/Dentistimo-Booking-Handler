# Booking Handler

Distributed System handling the bookings for the DENTISTIMO project

Responsibilities:
- Listen to MQQT broker for booking data from front end
- Parse mqtt message as an json object
- POST json object to database
- Publish via mqtt for confirmation
