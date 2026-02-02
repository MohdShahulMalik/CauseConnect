package com.merzah.causeconnect.causeconnect_backend;

import org.springframework.boot.SpringApplication;

public class TestCauseConnectServerApplication {

	public static void main(String[] args) {
		SpringApplication.from(CauseConnectServerApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
