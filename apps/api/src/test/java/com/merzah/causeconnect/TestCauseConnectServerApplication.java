package com.merzah.causeconnect;

import org.springframework.boot.SpringApplication;

public class TestCauseConnectServerApplication {

	public static void main(String[] args) {
		SpringApplication.from(CauseConnectServerApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
